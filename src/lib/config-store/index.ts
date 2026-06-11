// ============================================================
// AI API Relay — Config Store Factory
// ============================================================

import type { ConfigStore } from './types';
import { VercelKVConfigStore } from './vercel-kv-store';

let _defaultStore: ConfigStore | null = null;

export function getDefaultConfigStore(): ConfigStore {
  if (!_defaultStore) {
    _defaultStore = new VercelKVConfigStore();
  }
  return _defaultStore;
}

export function setDefaultConfigStore(store: ConfigStore): void {
  _defaultStore = store;
}
