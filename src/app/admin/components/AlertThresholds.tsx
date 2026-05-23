'use client';

import React, { useState, useEffect } from 'react';
import type { AlertThreshold } from '../types';

interface AlertThresholdsProps {
  apiKey: string;
  lang: 'zh' | 'en';
  i: any;
  providers: any[];
  initialThresholds: AlertThreshold[];
}

const btnPrimary: React.CSSProperties = {
  padding: '0.5rem 1.5rem',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#10b981',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
};

export default function AlertThresholds({
  apiKey,
  lang,
  i,
  providers,
  initialThresholds,
}: AlertThresholdsProps) {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [thresholdMessage, setThresholdMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setThresholds(initialThresholds);
  }, [initialThresholds]);

  const showThresholdMessage = (text: string, type: 'success' | 'error') => {
    setThresholdMessage({ text, type });
    setTimeout(() => setThresholdMessage(null), 4000);
  };

  const handleSaveThresholds = async () => {
    setSavingThresholds(true);
    try {
      // Only send thresholds that have at least one limit set
      const payload = thresholds.filter(t => t.dailyRequestLimit || t.dailyTokenLimit);
      const res = await fetch('/api/admin/webhooks/thresholds', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ thresholds: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Save failed');
      showThresholdMessage(i.thresholdSaved, 'success');
    } catch (e: any) {
      showThresholdMessage(`${i.thresholdFailed}: ${e.message}`, 'error');
    } finally {
      setSavingThresholds(false);
    }
  };

  const updateThreshold = (provider: string, field: 'dailyRequestLimit' | 'dailyTokenLimit', value: string) => {
    setThresholds(prev => prev.map(t => {
      if (t.provider !== provider) return t;
      const num = value === '' ? undefined : parseInt(value, 10);
      return { ...t, [field]: (num !== undefined && !isNaN(num) && num > 0) ? num : undefined };
    }));
  };

  return (
    <section className="glass-panel">
      <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
        {i.thresholdTitle}
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 0, marginBottom: '1.25rem', lineHeight: '1.5' }}>
        {i.thresholdDesc}
      </p>

      {thresholdMessage && (
        <div style={{
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          backgroundColor: thresholdMessage.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${thresholdMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: thresholdMessage.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          {thresholdMessage.text}
        </div>
      )}

      {providers.length === 0 ? (
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          {lang === 'zh' ? '暂无已配置的服务商' : 'No providers configured'}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#9ca3af', fontWeight: 500, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', whiteSpace: 'nowrap' }}>
                    {i.providerCol}
                  </th>
                  <th style={{ textAlign: 'right', padding: '0.6rem 0.75rem', color: '#9ca3af', fontWeight: 500, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', whiteSpace: 'nowrap' }}>
                    {i.dailyRequestLimitCol}
                  </th>
                  <th style={{ textAlign: 'right', padding: '0.6rem 0.75rem', color: '#9ca3af', fontWeight: 500, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', whiteSpace: 'nowrap' }}>
                    {i.dailyTokenLimitCol}
                  </th>
                </tr>
              </thead>
              <tbody>
                {thresholds.map((th) => {
                  const prov = providers.find(p => p.id === th.provider);
                  return (
                    <tr key={th.provider}>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#e5e7eb', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        {prov?.name || th.provider}
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>({th.provider})</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <input
                          type="number"
                          min="0"
                          placeholder={i.unlimitedPlaceholder}
                          value={th.dailyRequestLimit ?? ''}
                          onChange={(e) => updateThreshold(th.provider, 'dailyRequestLimit', e.target.value)}
                          className="threshold-input"
                        />
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <input
                          type="number"
                          min="0"
                          placeholder={i.unlimitedPlaceholder}
                          value={th.dailyTokenLimit ?? ''}
                          onChange={(e) => updateThreshold(th.provider, 'dailyTokenLimit', e.target.value)}
                          className="threshold-input"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button
              onClick={handleSaveThresholds}
              disabled={savingThresholds}
              style={{
                ...btnPrimary,
                opacity: savingThresholds ? 0.6 : 1,
                cursor: savingThresholds ? 'wait' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!savingThresholds) e.currentTarget.style.backgroundColor = '#059669'; }}
              onMouseLeave={(e) => { if (!savingThresholds) e.currentTarget.style.backgroundColor = '#10b981'; }}
            >
              {savingThresholds ? '...' : i.saveThresholds}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
