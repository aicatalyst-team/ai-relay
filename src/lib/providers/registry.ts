// ============================================================
// AI API Relay — Provider Registry
// ============================================================

import type { ProviderConfig } from './types';

/**
 * All supported providers and their configurations.
 * To add a new provider, just add an entry here.
 */
export const PROVIDERS: Record<string, ProviderConfig> = {
  // ⚠️ lpgpt 排在 openai 前面，gpt-5.x 走 lpgpt，gpt-4o 等走 OpenAI
  lpgpt: {
    name: 'lpgpt',
    displayName: 'LPGPT (GPT-5)',
    baseUrl: 'https://lpgpt.us/v1',
    modelPrefixes: ['gpt-5.'],
    headerFormat: 'openai',
    envKeyField: 'LPGPT_KEYS',
    envBaseUrlField: 'LPGPT_BASE_URL',
  },
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    modelPrefixes: ['gpt-', 'o1-', 'o3-', 'o4-', 'chatgpt-', 'dall-e-'],
    headerFormat: 'openai',
    envKeyField: 'OPENAI_KEYS',
    envBaseUrlField: 'OPENAI_BASE_URL',
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com/v1',
    modelPrefixes: ['claude-'],
    headerFormat: 'anthropic',
    envKeyField: 'CLAUDE_KEYS',
    envBaseUrlField: 'CLAUDE_BASE_URL',
  },
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    modelPrefixes: ['deepseek-'],
    headerFormat: 'openai',
    envKeyField: 'DEEPSEEK_KEYS',
    envBaseUrlField: 'DEEPSEEK_BASE_URL',
  },
  // ⚠️ xiaomimimo 排在 xiaomi 前面，同为 mimo- 前缀时优先匹配
  xiaomimimo: {
    name: 'xiaomimimo',
    displayName: 'Xiaomi MiMo (SGP)',
    baseUrl: 'https://token-plan-sgp.xiaomimimo.com/v1',
    modelPrefixes: ['mimo-'],
    headerFormat: 'azure',
    envKeyField: 'XIAOMIMIMO_SGP_KEYS',
    envBaseUrlField: 'XIAOMIMIMO_SGP_BASE_URL',
  },
  xiaomi: {
    name: 'xiaomi',
    displayName: 'Xiaomi (MiMo CN)',
    baseUrl: 'https://api.xiaomi.com/v1',
    modelPrefixes: ['mimo-'],
    headerFormat: 'openai',
    envKeyField: 'XIAOMI_KEYS',
    envBaseUrlField: 'XIAOMI_BASE_URL',
  },
};

/** Known provider names (for usage trend queries etc.) */
export const PROVIDER_NAMES = Object.keys(PROVIDERS);
