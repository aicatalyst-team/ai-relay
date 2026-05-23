'use client';

import React, { useState, useEffect } from 'react';

interface ReportSettingsProps {
  apiKey: string;
  i: any;
  initialReportTime: string;
  initialReportTimezone: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  color: '#d1d5db',
  fontSize: '0.9rem',
  fontWeight: 500,
  marginBottom: '0.35rem',
  display: 'block',
};

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

export default function ReportSettings({
  apiKey,
  i,
  initialReportTime,
  initialReportTimezone,
}: ReportSettingsProps) {
  const [reportTime, setReportTime] = useState('21:00');
  const [reportTimezone, setReportTimezone] = useState('Asia/Shanghai');
  const [savingReport, setSavingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setReportTime(initialReportTime);
    setReportTimezone(initialReportTimezone);
  }, [initialReportTime, initialReportTimezone]);

  const showReportMessage = (text: string, type: 'success' | 'error') => {
    setReportMessage({ text, type });
    setTimeout(() => setReportMessage(null), 4000);
  };

  const handleSaveReport = async () => {
    setSavingReport(true);
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ reportTime, reportTimezone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Save failed');
      showReportMessage(i.reportSaved, 'success');
    } catch (e: any) {
      showReportMessage(`${i.reportFailed}: ${e.message}`, 'error');
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <section className="glass-panel">
      <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
        {i.reportTitle}
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 0, marginBottom: '1.25rem', lineHeight: '1.5' }}>
        {i.reportDesc}
      </p>

      {reportMessage && (
        <div style={{
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          backgroundColor: reportMessage.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${reportMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: reportMessage.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          {reportMessage.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={labelStyle}>{i.reportTimeLabel}</label>
          <input
            type="time"
            value={reportTime}
            onChange={(e) => setReportTime(e.target.value)}
            style={{ ...inputStyle, width: '140px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={labelStyle}>{i.reportTimezoneLabel}</label>
          <select
            value={reportTimezone}
            onChange={(e) => setReportTimezone(e.target.value)}
            className="custom-select"
            style={{ ...inputStyle, width: '220px', cursor: 'pointer' }}
          >
            <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <button
          onClick={handleSaveReport}
          disabled={savingReport}
          style={{
            ...btnPrimary,
            opacity: savingReport ? 0.6 : 1,
            cursor: savingReport ? 'wait' : 'pointer',
          }}
          onMouseEnter={(e) => { if (!savingReport) e.currentTarget.style.backgroundColor = '#059669'; }}
          onMouseLeave={(e) => { if (!savingReport) e.currentTarget.style.backgroundColor = '#10b981'; }}
        >
          {savingReport ? '...' : i.saveReport}
        </button>
      </div>
    </section>
  );
}
