// ============================================================
// AI API Relay — Core Relay Logic (with 429 protection)
// ============================================================

import type { ChatCompletionRequest } from '../types';
import type { RelayResult } from '../providers/types';
import { resolveProvider, getUpstreamUrl, resolveModelAlias } from '../providers';
import { selectKey, markCooldown, getKeyPool } from './key-pool';
import { buildHeaders, transformToAnthropic } from './transform';
import { RelayError } from '../errors';
import { KVUsageStorage } from '../usage/storage/kv-storage';
import {
  checkRateLimit,
  record429,
  recordSuccess,
  backoffSleep,
} from './rate-limiter';

const usageStorage = new KVUsageStorage();

/**
 * Record an upstream error to KV for admin dashboard tracking.
 * Fire-and-forget — never blocks the request.
 */
function recordError(
  provider: string,
  keyHash: string,
  statusCode: number,
  reason: string
): void {
  usageStorage.recordError({ provider, keyHash, statusCode, reason }).catch(() => {});
}

/**
 * Core relay function — forwards a chat completion request to the upstream provider.
 * Supports both streaming and non-streaming.
 *
 * 429 protection layers:
 * 1. Token bucket — proactive rate limiting before the request
 * 2. Circuit breaker — stops requests after consecutive 429s
 * 3. Exponential backoff — reactive delay between retries
 * 4. Key rotation — switch to next available key on 429/5xx
 */
export async function relayRequest(
  body: ChatCompletionRequest
): Promise<RelayResult> {
  const provider = resolveProvider(body.model);
  if (!provider) {
    throw new RelayError(
      `Unknown model: ${body.model}. Supported prefixes: gpt-, claude-, deepseek-, mimo-`,
      'invalid_request_error',
      400
    );
  }

  // Resolve model alias
  const resolvedModel = resolveModelAlias(body.model);

  // Pre-flight: check rate limiter (token bucket + circuit breaker)
  const rateLimitCheck = checkRateLimit(provider.name);
  if (!rateLimitCheck.allowed) {
    throw new RelayError(
      rateLimitCheck.reason || 'Rate limit exceeded',
      'rate_limit_error',
      429
    );
  }

  // Select an API key
  const apiKey = selectKey(provider);
  if (!apiKey) {
    throw new RelayError(
      `No API keys configured for provider: ${provider.displayName}`,
      'server_error',
      503
    );
  }

  const url = getUpstreamUrl(provider);
  const isAnthropic = provider.headerFormat === 'anthropic';

  // Transform request body if needed (use resolved model name)
  // Inject stream_options.include_usage for streaming so upstream returns usage in final SSE chunk
  const bodyWithResolvedModel: Record<string, unknown> = { ...body, model: resolvedModel };
  if (body.stream && !isAnthropic) {
    const existingOpts = typeof body.stream_options === 'object' && body.stream_options !== null ? body.stream_options : {};
    bodyWithResolvedModel.stream_options = { include_usage: true, ...existingOpts };
  }
  const requestBody = isAnthropic ? transformToAnthropic(bodyWithResolvedModel as ChatCompletionRequest) : bodyWithResolvedModel;

  // Retry with key rotation + exponential backoff
  const pool = getKeyPool(provider);
  const maxRetries = Math.min(pool.keys.length, 3);
  let lastError: Error | null = null;
  let currentKey = apiKey;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Exponential backoff between retries (skip on first attempt)
    if (attempt > 0) {
      await backoffSleep(attempt - 1);
    }

    // Re-check circuit breaker before each attempt
    const retryCheck = checkRateLimit(provider.name);
    if (!retryCheck.allowed) {
      throw new RelayError(
        retryCheck.reason || 'Rate limit exceeded',
        'rate_limit_error',
        429
      );
    }

    const startTime = Date.now();
    try {
      const upstreamResponse = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(provider.headerFormat, currentKey.key, !!body.stream),
        body: JSON.stringify(requestBody),
      });

      const latencyMs = Date.now() - startTime;

      // 429 → record in rate limiter + try next key
      if (upstreamResponse.status === 429) {
        record429(provider.name);
        markCooldown(currentKey);
        recordError(provider.name, currentKey.hash, 429, 'Rate limited by upstream');
        const nextKey = selectKey(provider);
        if (nextKey && nextKey.hash !== currentKey.hash) {
          currentKey = nextKey;
          continue;
        }
        return { response: upstreamResponse, provider, apiKey: currentKey };
      }

      // 401/403 → key invalid/expired, rotate to next key
      if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
        markCooldown(currentKey);
        recordError(provider.name, currentKey.hash, upstreamResponse.status, 'Auth failed — key invalid or expired');
        const nextKey = selectKey(provider);
        if (nextKey && nextKey.hash !== currentKey.hash) {
          currentKey = nextKey;
          continue;
        }
        return { response: upstreamResponse, provider, apiKey: currentKey };
      }

      // 5xx → try next key (but don't count as 429 for circuit breaker)
      if (upstreamResponse.status >= 500) {
        markCooldown(currentKey);
        recordError(provider.name, currentKey.hash, upstreamResponse.status, 'Upstream server error');
        const nextKey = selectKey(provider);
        if (nextKey && nextKey.hash !== currentKey.hash) {
          currentKey = nextKey;
          continue;
        }
        return { response: upstreamResponse, provider, apiKey: currentKey };
      }

      // Success → record in rate limiter
      recordSuccess(provider.name);

      // NOTE: Usage tracking is done in the route handler, not here.
      // This avoids double-counting for non-streaming responses.

      return { response: upstreamResponse, provider, apiKey: currentKey };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      markCooldown(currentKey);
      const nextKey = selectKey(provider);
      if (nextKey && nextKey.hash !== currentKey.hash) {
        currentKey = nextKey;
        continue;
      }
    }
  }

  throw new RelayError(
    `All retry attempts failed for ${provider.displayName}: ${lastError?.message}`,
    'server_error',
    502
  );
}
