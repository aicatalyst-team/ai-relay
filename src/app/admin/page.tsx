'use client';

import { useState, useEffect } from 'react';
import TokenTrendChart from './components/TokenTrendChart';

interface ProviderInfo {
  name: string;
  id: string;
  keyCount: number;
  availableKeys: number;
  configured: boolean;
  modelPrefixes: string[];
  errors?: Record<string, number>;
  keyErrors?: Array<{
    keyHash: string;
    errors: Record<string, { count: number; reason: string }>;
  }>;
}

interface AdminData {
  status: string;
  timestamp: string;
  providers: ProviderInfo[];
  usage: {
    requests: number;
    tokens: number;
    promptTokens: number;
    completionTokens: number;
    providers: Record<string, { requests: number; tokens: number; promptTokens: number; completionTokens: number }>;
  };
  quota: {
    daily: { used: number; limit: number | string };
    monthly: { used: number; limit: number | string };
    allowed: boolean;
  };
  config: {
    dailyLimit: number | null;
    monthlyLimit: number | null;
  };
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restore cached API key from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('airelay_admin_key');
    if (cached) {
      setApiKey(cached);
      setLoading(true);
      fetch('/api/admin', {
        headers: { Authorization: `Bearer ${cached}` },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem('airelay_admin_key');
            return;
          }
          return res.json();
        })
        .then((json) => {
          if (json) {
            setData(json);
            setAuthenticated(true);
          }
        })
        .catch(() => {
          localStorage.removeItem('airelay_admin_key');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.status === 401) {
        setError('Invalid API key');
        setAuthenticated(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthenticated(true);
      localStorage.setItem('airelay_admin_key', apiKey);
    } catch (e) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const fmtNum = (n: number) => n.toLocaleString();
  const fmtTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  if (!authenticated) {
    return (
      <main style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: '2rem',
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🔐 Admin Login</h1>
        <div style={{
          display: 'flex', gap: '0.5rem', maxWidth: '400px', width: '100%',
        }}>
          <input
            type="password"
            placeholder="Enter RELAY_API_KEY"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: '8px',
              border: '1px solid #333', backgroundColor: '#111', color: '#e0e0e0',
              fontSize: '1rem', outline: 'none',
            }}
          />
          <button
            onClick={fetchData}
            disabled={loading || !apiKey}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
              backgroundColor: '#2563eb', color: 'white', fontSize: '1rem',
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '...' : 'Login'}
          </button>
        </div>
        {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
      </main>
    );
  }

  return (
    <main style={{
      maxWidth: '900px', margin: '0 auto', padding: '2rem',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>⚡ AI Relay Admin</h1>
        <button
          onClick={fetchData}
          style={{
            padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #333',
            backgroundColor: 'transparent', color: '#888', cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Quota Status */}
      <section style={{
        padding: '1.5rem', borderRadius: '12px', border: '1px solid #333',
        backgroundColor: '#111', marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>📊 Quota Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Daily Requests</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {fmtNum(data!.quota.daily.used)}
              <span style={{ color: '#666', fontSize: '1rem' }}>
                {' / '}{typeof data!.quota.daily.limit === 'number' ? fmtNum(data!.quota.daily.limit) : '∞'}
              </span>
            </div>
          </div>
          <div>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Monthly Requests</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {fmtNum(data!.quota.monthly.used)}
              <span style={{ color: '#666', fontSize: '1rem' }}>
                {' / '}{typeof data!.quota.monthly.limit === 'number' ? fmtNum(data!.quota.monthly.limit) : '∞'}
              </span>
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '6px',
          display: 'inline-block', fontSize: '0.85rem',
          backgroundColor: data!.quota.allowed ? '#064e3b' : '#7f1d1d',
          color: data!.quota.allowed ? '#34d399' : '#fca5a5',
        }}>
          {data!.quota.allowed ? '✅ Within limits' : '🚫 Rate limited'}
        </div>
      </section>

      {/* Today's Usage */}
      <section style={{
        padding: '1.5rem', borderRadius: '12px', border: '1px solid #333',
        backgroundColor: '#111', marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>📈 Today&apos;s Usage</h2>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Requests</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {fmtNum(data!.usage.requests)}
            </div>
          </div>
          <div>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Total Tokens</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {fmtTokens(data!.usage.tokens)}
            </div>
          </div>
          <div>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Prompt Tokens</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>
              {fmtTokens(data!.usage.promptTokens || 0)}
            </div>
          </div>
          <div>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Completion Tokens</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#34d399' }}>
              {fmtTokens(data!.usage.completionTokens || 0)}
            </div>
          </div>
        </div>

        {/* Per-provider usage breakdown */}
        {data!.usage.providers && Object.keys(data!.usage.providers).length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '0.75rem' }}>By Provider</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#888' }}>Provider</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', color: '#888' }}>Requests</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', color: '#888' }}>Prompt</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', color: '#888' }}>Completion</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', color: '#888' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data!.usage.providers).map(([name, stats]) => (
                  <tr key={name} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '0.5rem' }}>{name}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtNum(stats.requests)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#60a5fa' }}>{fmtTokens(stats.promptTokens)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#34d399' }}>{fmtTokens(stats.completionTokens)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtTokens(stats.tokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Token Consumption Trend */}
      <TokenTrendChart apiKey={apiKey} />

      {/* Error Statistics */}
      {data!.providers.some((p) => p.errors && Object.keys(p.errors).length > 0) && (
        <section style={{
          padding: '1.5rem', borderRadius: '12px', border: '1px solid #333',
          backgroundColor: '#111', marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>🚨 API Errors (Today)</h2>
          {data!.providers
            .filter((p) => p.errors && Object.keys(p.errors).length > 0)
            .map((p) => (
              <div key={p.id} style={{ marginBottom: '1.2rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#f87171' }}>
                  {p.name}
                </div>
                {/* Summary by status code */}
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {Object.entries(p.errors!).map(([code, count]) => (
                    <span key={code} style={{
                      padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem',
                      backgroundColor: code === '429' ? '#78350f' : code.startsWith('4') ? '#7f1d1d' : '#1e1e1e',
                      color: code === '429' ? '#fbbf24' : code.startsWith('4') ? '#fca5a5' : '#888',
                      border: '1px solid #333',
                    }}>
                      HTTP {code}: <strong>{count}</strong> 次
                    </span>
                  ))}
                </div>
                {/* Per-key breakdown */}
                {p.keyErrors && p.keyErrors.length > 0 && (
                  <div style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#666' }}>
                    {p.keyErrors.map((ke) => (
                      <div key={ke.keyHash} style={{ marginBottom: '0.3rem' }}>
                        <span style={{ fontFamily: 'monospace', color: '#888' }}>
                          key:{ke.keyHash.slice(0, 8)}
                        </span>
                        {Object.entries(ke.errors).map(([code, detail]) => (
                          <span key={code} style={{ marginLeft: '0.8rem' }}>
                            <span style={{ color: '#f87171' }}>{code}×{detail.count}</span>
                            {detail.reason && (
                              <span style={{ color: '#555', marginLeft: '0.3rem' }}>
                                — {detail.reason}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </section>
      )}

      {/* Provider Key Pools */}
      <section style={{
        padding: '1.5rem', borderRadius: '12px', border: '1px solid #333',
        backgroundColor: '#111',
      }}>
        <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>🔑 Provider Key Pools</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '0.6rem', color: '#888' }}>Provider</th>
              <th style={{ textAlign: 'center', padding: '0.6rem', color: '#888' }}>Status</th>
              <th style={{ textAlign: 'center', padding: '0.6rem', color: '#888' }}>Keys</th>
              <th style={{ textAlign: 'center', padding: '0.6rem', color: '#888' }}>Available</th>
              <th style={{ textAlign: 'left', padding: '0.6rem', color: '#888' }}>Model Prefixes</th>
            </tr>
          </thead>
          <tbody>
            {data!.providers.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem',
                    backgroundColor: p.configured ? '#064e3b' : '#7f1d1d',
                    color: p.configured ? '#34d399' : '#fca5a5',
                  }}>
                    {p.configured ? 'OK' : 'NO KEYS'}
                  </span>
                </td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}>{p.keyCount}</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                  <span style={{
                    color: p.availableKeys > 0 ? '#34d399' : '#ef4444',
                    fontWeight: 'bold',
                  }}>
                    {p.availableKeys}
                  </span>
                </td>
                <td style={{
                  padding: '0.6rem', fontFamily: 'monospace', fontSize: '0.85rem',
                  color: '#888',
                }}>
                  {p.modelPrefixes.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p style={{
        color: '#555', marginTop: '2rem', fontSize: '0.8rem', textAlign: 'center',
      }}>
        Auto-refreshes every 15s · Data as of {new Date(data!.timestamp).toLocaleTimeString()}
      </p>
    </main>
  );
}
