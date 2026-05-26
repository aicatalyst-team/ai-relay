// ============================================================
// AI API Relay — Smart Route Engine
// ============================================================
// Core routing engine with:
// - In-memory route table (refreshed every 5 min from KV)
// - Auto-failover: 3 consecutive failures → switch provider
// - Auto-recovery: provider recovers → switch back
// - Integrates with existing circuit breaker + rate limiter

import type {
  RoutingConfig,
  RoutingDecision,
  RoutingStatus,
  ProviderHealthInfo,
  ProviderHealthStatus,
} from './types';
import { getKV } from './kv-client';
import { getLatencyStats, getSuccessRate, recordLatency } from './latency-tracker';
import { routeByStrategy } from './strategy';

// ---------------------------------------------------------------------------
// In-memory route table + health tracking
// ---------------------------------------------------------------------------

/** Current routing config (cached in memory, refreshed from KV) */
let cachedConfig: RoutingConfig | null = null;
const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let lastConfigFetch = 0;

/** Provider failure counters (in-memory, resets on cold start) */
const failureCounters = new Map<string, number>();
const lastFailureAt = new Map<string, number>();
const lastSuccessAt = new Map<string, number>();

/** Recent routing switches (capped at 50) */
const recentSwitches: Array<{
  from: string;
  to: string;
  reason: string;
  timestamp: number;
}> = [];
const MAX_SWITCH_LOG = 50;

/** Request counter */
let totalRequests = 0;
const routingSince = Date.now();

// ---------------------------------------------------------------------------
// Config management
// ---------------------------------------------------------------------------

/**
 * Load routing config from KV with in-memory cache.
 */
export async function getRoutingConfig(): Promise<RoutingConfig> {
  const now = Date.now();
  if (cachedConfig && now - lastConfigFetch < CONFIG_CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const kv = await getKV();
    if (kv) {
      const stored = (await kv.get('relay:route:config')) as RoutingConfig | null;
      if (stored && typeof stored === 'object') {
        cachedConfig = { ...getDefaultConfig(), ...stored };
        lastConfigFetch = now;
        return cachedConfig;
      }
    }
  } catch {
    // Fall through to default
  }

  cachedConfig = getDefaultConfig();
  lastConfigFetch = now;
  return cachedConfig;
}

/**
 * Save routing config to KV and update cache.
 */
export async function saveRoutingConfig(config: Partial<RoutingConfig>): Promise<RoutingConfig> {
  const current = await getRoutingConfig();
  const updated: RoutingConfig = {
    ...current,
    ...config,
    updatedAt: Date.now(),
  };

  try {
    const kv = await getKV();
    if (kv) {
      await kv.set('relay:route:config', updated);
    }
  } catch {
    // Best effort
  }

  cachedConfig = updated;
  lastConfigFetch = Date.now();
  return updated;
}

function getDefaultConfig(): RoutingConfig {
  return {
    strategy: 'latency',
    costWeights: [],
    maxLatencyMs: 2000,
    failureThreshold: 3,
    recoverySeconds: 30,
    stickySession: false,
    providerTimeoutMs: {},
    maxRetries: 3,
    updatedAt: 0,
  };
}

// ---------------------------------------------------------------------------
// Health tracking
// ---------------------------------------------------------------------------

/**
 * Record a request result for a provider.
 * Updates failure counters and triggers failover if threshold exceeded.
 */
export function recordProviderResult(
  provider: string,
  success: boolean,
  latencyMs: number,
  statusCode?: number
): void {
  // Record latency
  recordLatency(provider, latencyMs, success, statusCode);

  totalRequests++;

  if (success) {
    failureCounters.set(provider, 0);
    lastSuccessAt.set(provider, Date.now());
  } else {
    const failures = (failureCounters.get(provider) || 0) + 1;
    failureCounters.set(provider, failures);
    lastFailureAt.set(provider, Date.now());
  }
}

/**
 * Get health info for a provider.
 */
export async function getProviderHealth(provider: string, displayName?: string): Promise<ProviderHealthInfo> {
  const latencyStats = await getLatencyStats(provider);
  const successRate = await getSuccessRate(provider);
  const failures = failureCounters.get(provider) || 0;

  let status: ProviderHealthStatus = 'unknown';
  if (latencyStats.sampleCount > 0) {
    if (successRate >= 0.95) status = 'healthy';
    else if (successRate >= 0.8) status = 'degraded';
    else status = 'down';
  }

  return {
    provider,
    displayName: displayName || provider,
    status,
    avgLatencyMs: latencyStats.avgLatencyMs,
    successRate,
    consecutiveFailures: failures,
    lastFailureAt: lastFailureAt.get(provider) || 0,
    lastSuccessAt: lastSuccessAt.get(provider) || 0,
    availableKeys: 0,  // Filled by caller from key pool stats
    totalKeys: 0,
  };
}

/**
 * Check if a provider should be auto-failed-over.
 */
export function shouldFailover(provider: string, config?: RoutingConfig): boolean {
  const threshold = config?.failureThreshold || 3;
  const failures = failureCounters.get(provider) || 0;
  return failures >= threshold;
}

/**
 * Check if a provider has recovered (stable for recoverySeconds).
 */
export function hasRecovered(provider: string, config?: RoutingConfig): boolean {
  const recoveryMs = (config?.recoverySeconds || 30) * 1000;
  const lastSuccess = lastSuccessAt.get(provider) || 0;
  const lastFailure = lastFailureAt.get(provider) || 0;

  // If last success is more recent than last failure and stable for recoveryMs
  return lastSuccess > lastFailure && (Date.now() - lastSuccess) >= recoveryMs;
}

// ---------------------------------------------------------------------------
// Main routing entry point
// ---------------------------------------------------------------------------

/**
 * Smart route a request to the best provider.
 * This is the main entry point called from the relay.
 *
 * @param requestedProvider  The provider originally resolved from the model name
 * @param providerHealthMap  Optional pre-built health map (for efficiency)
 * @returns Routing decision
 */
export async function smartRoute(
  requestedProvider: string,
  providerHealthMap?: Map<string, ProviderHealthInfo>
): Promise<RoutingDecision> {
  const config = await getRoutingConfig();

  // Build health map if not provided
  if (!providerHealthMap) {
    providerHealthMap = new Map();
    // At minimum, include the requested provider
    providerHealthMap.set(requestedProvider, await getProviderHealth(requestedProvider));
  }

  // Check if requested provider should be failed over
  if (shouldFailover(requestedProvider, config)) {
    // Find best alternative
    const decision = await routeByStrategy(config, providerHealthMap, undefined);
    if (decision.provider !== requestedProvider) {
      logSwitch(requestedProvider, decision.provider, `Auto-failover: ${failureCounters.get(requestedProvider)} consecutive failures`);
      return decision;
    }
  }

  // Use strategy engine to route
  const decision = await routeByStrategy(config, providerHealthMap, requestedProvider);

  // Log if the routing engine chose a different provider than requested
  if (decision.provider !== requestedProvider) {
    logSwitch(requestedProvider, decision.provider, decision.reason);
  }

  return decision;
}

/**
 * Get current routing status for the admin dashboard.
 */
export async function getRoutingStatus(
  providerNames: string[],
  displayNames?: Record<string, string>
): Promise<RoutingStatus> {
  const config = await getRoutingConfig();
  const activeProviders: ProviderHealthInfo[] = [];

  for (const name of providerNames) {
    const health = await getProviderHealth(name, displayNames?.[name]);
    activeProviders.push(health);
  }

  return {
    strategy: config.strategy,
    activeProviders,
    recentSwitches: [...recentSwitches].reverse(),
    totalRequests,
    routingSince,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function logSwitch(from: string, to: string, reason: string): void {
  recentSwitches.push({ from, to, reason, timestamp: Date.now() });
  if (recentSwitches.length > MAX_SWITCH_LOG) {
    recentSwitches.splice(0, recentSwitches.length - MAX_SWITCH_LOG);
  }
}

/**
 * Reset failure counter for a provider (e.g., after manual intervention).
 */
export function resetProviderFailures(provider: string): void {
  failureCounters.set(provider, 0);
}
