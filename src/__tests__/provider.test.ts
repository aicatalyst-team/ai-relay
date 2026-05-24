import { describe, it, expect } from 'vitest';
import { resolveProvider, resolveFallbackModel, resolveUpstreamModel } from '../lib/providers/resolver';

describe('mimo-v2.5 provider resolution and mapping tests', () => {
  it('should resolve the correct provider for each mimo-v2.5 variant', async () => {
    // mimo-v2.5-coding should resolve to xiaomi_coding
    const codingProvider = await resolveProvider('mimo-v2.5-coding');
    expect(codingProvider).not.toBeNull();
    expect(codingProvider?.name).toBe('xiaomi_coding');

    // mimo-v2.5-sgp should resolve to xiaomi_sgp_coding
    const sgpProvider = await resolveProvider('mimo-v2.5-sgp');
    expect(sgpProvider).not.toBeNull();
    expect(sgpProvider?.name).toBe('xiaomi_sgp_coding');

    // mimo-v2.5 should resolve to xiaomi (since prefix is 'mimo-', which matches, and is standard)
    const baseProvider = await resolveProvider('mimo-v2.5');
    expect(baseProvider).not.toBeNull();
    expect(baseProvider?.name).toBe('xiaomi');
  });

  it('should map the virtual model names to correct upstream model ID', async () => {
    const xiaomiProvider = await resolveProvider('mimo-v2.5');
    const sgpProvider = await resolveProvider('mimo-v2.5-sgp');
    const codingProvider = await resolveProvider('mimo-v2.5-coding');

    expect(resolveUpstreamModel('mimo-v2.5-coding', codingProvider!)).toBe('mimo-v2.5');
    expect(resolveUpstreamModel('mimo-v2.5-sgp', sgpProvider!)).toBe('mimo-v2.5');
    expect(resolveUpstreamModel('mimo-v2.5', xiaomiProvider!)).toBe('mimo-v2.5');
  });

  it('should resolve correct fallback model for base mimo-v2.5 models', async () => {
    // Fallback to xiaomi_sgp_coding with base mimo-v2.5 model should resolve to mimo-v2.5-sgp
    const sgpFallback = await resolveFallbackModel('mimo-v2.5', 'xiaomi_sgp_coding');
    expect(sgpFallback).toBe('mimo-v2.5-sgp');

    // Fallback to xiaomi with base mimo-v2.5 should resolve to mimo-v2.5
    const xiaomiFallback = await resolveFallbackModel('mimo-v2.5', 'xiaomi');
    expect(xiaomiFallback).toBe('mimo-v2.5');

    // Fallback to xiaomi_coding with base mimo-v2.5 should resolve to mimo-v2.5-coding
    const codingFallback = await resolveFallbackModel('mimo-v2.5', 'xiaomi_coding');
    expect(codingFallback).toBe('mimo-v2.5-coding');

    // Fallback to xiaomi_tudo with base mimo-v2.5 should resolve to mimo-v2.5
    const tudoFallback = await resolveFallbackModel('mimo-v2.5', 'xiaomi_tudo');
    expect(tudoFallback).toBe('mimo-v2.5');
  });

  it('should resolve correct fallback model for pro model variants', async () => {
    // Fallback to xiaomi_sgp_coding with mimo-v2.5-pro should resolve to mimo-v2.5-pro-sgp
    const sgpFallback = await resolveFallbackModel('mimo-v2.5-pro', 'xiaomi_sgp_coding');
    expect(sgpFallback).toBe('mimo-v2.5-pro-sgp');

    // Fallback to xiaomi with mimo-v2.5-pro should resolve to mimo-v2.5-pro
    const xiaomiFallback = await resolveFallbackModel('mimo-v2.5-pro', 'xiaomi');
    expect(xiaomiFallback).toBe('mimo-v2.5-pro');

    // Fallback to xiaomi_coding with mimo-v2.5-pro should resolve to mimo-v2.5-pro-coding
    const codingFallback = await resolveFallbackModel('mimo-v2.5-pro', 'xiaomi_coding');
    expect(codingFallback).toBe('mimo-v2.5-pro-coding');

    // Fallback to xiaomi_tudo with mimo-v2.5-pro should resolve to mimo-v2.5-pro
    const tudoFallback = await resolveFallbackModel('mimo-v2.5-pro', 'xiaomi_tudo');
    expect(tudoFallback).toBe('mimo-v2.5-pro');
  });

  it('should support vision for all mimo-v2.5 and pro variants', async () => {
    const xiaomiProvider = await resolveProvider('mimo-v2.5');
    const sgpProvider = await resolveProvider('mimo-v2.5-sgp');
    const codingProvider = await resolveProvider('mimo-v2.5-coding');
    const tudoProvider = await resolveProvider('mimo-v2.5-pro'); // resolves to xiaomi_tudo because of length

    expect(xiaomiProvider?.models?.find(m => m.id === 'mimo-v2.5')?.supportsVision).toBe(true);
    expect(xiaomiProvider?.models?.find(m => m.id === 'mimo-v2.5-pro')?.supportsVision).toBe(true);

    expect(sgpProvider?.models?.find(m => m.id === 'mimo-v2.5-sgp')?.supportsVision).toBe(true);
    expect(sgpProvider?.models?.find(m => m.id === 'mimo-v2.5-pro-sgp')?.supportsVision).toBe(true);
    expect(sgpProvider?.models?.find(m => m.id === 'mimo-v2.5-flash-sgp')?.supportsVision).toBe(true);

    expect(codingProvider?.models?.find(m => m.id === 'mimo-v2.5-coding')?.supportsVision).toBe(true);
    expect(codingProvider?.models?.find(m => m.id === 'mimo-v2.5-pro-coding')?.supportsVision).toBe(true);

    expect(tudoProvider?.models?.find(m => m.id === 'mimo-v2.5')?.supportsVision).toBe(true);
    expect(tudoProvider?.models?.find(m => m.id === 'mimo-v2.5-pro')?.supportsVision).toBe(true);
  });
});
