import { useState, useEffect } from 'react';
import { getDevices, getLogs, getRiskSummary, getSimStatus } from '../api/client';
import { SectionHeader, RiskBadge, Badge, Spinner, ErrorBox, Button } from '../components/UI';
import { downloadReport, sendReport } from '../utils/reportGenerator';
import { sounds } from '../utils/soundEngine';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [devRes, logRes, riskRes, simRes] = await Promise.all([
          getDevices(),
          getLogs(),
          getRiskSummary(),
          getSimStatus(),
        ]);
        setData({
          devices: devRes.data.devices,
          logs: logRes.data.logs,
          risk: riskRes.data,
          summary: simRes.data,
        });
      } catch {
        setError('Failed to load report data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDownload = async () => {
    setGenerating(true);
    sounds.click();
    try {
      downloadReport(data);
      sounds.reportGenerated();
    } catch (err) {
      sounds.warning();
      setError('PDF generation failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setSentMsg('');
    setError('');
    sounds.click();
    try {
      const result = await sendReport(data);
      sounds.emailSent();
      setSentMsg(`Report successfully sent to ${result.recipient}`);
    } catch (err) {
      sounds.warning();
      setError('Email send failed: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  const { devices, logs, risk, summary } = data;
  const compromised = devices.filter(d => d.compromised);
  const critLogs = logs.filter(l => l.type === 'CRITICAL');

  return (
    <div className="space-y-6 slide-in">
      <SectionHeader
        title="REPORT GENERATOR"
        subtitle="Generate and distribute executive security simulation reports"
        action={
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="primary" loading={generating}>
              ⬇ Download PDF
            </Button>
            <Button onClick={handleSend} variant="yellow" loading={sending}>
              ✉ Send Report
            </Button>
          </div>
        }
      />

      {sentMsg && (
        <div className="card p-4 border-accent/30 bg-accent/5 log-entry">
          <div className="flex items-center gap-2 text-accent text-sm font-mono">
            <span>✓</span>
            {sentMsg}
          </div>
        </div>
      )}

      {/* Report preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header preview */}
          <div className="card p-6 border-border"
            style={{ background: 'linear-gradient(135deg, #0d1117 0%, #111820 100%)' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="font-display text-xs font-bold text-accent tracking-widest mb-1">
                  REDTEAM SIMULATION PLATFORM
                </div>
                <h2 className="font-display text-2xl font-black text-text">Security Assessment Report</h2>
                <div className="text-textDim text-xs font-mono mt-1">
                  Generated: {new Date().toLocaleString()}
                </div>
              </div>
              <RiskBadge level={risk?.riskLevel || 'LOW'} />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Devices Scanned', val: devices.length, color: 'text-text' },
                { label: 'Compromised', val: compromised.length, color: 'text-red' },
                { label: 'Attack Stages', val: summary?.attackStagesExecuted || 0, color: 'text-yellow' },
                { label: 'Critical Events', val: critLogs.length, color: 'text-red' },
              ].map(s => (
                <div key={s.label} className="bg-bg border border-border rounded p-3 text-center">
                  <div className={`font-display text-xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-textDim text-[10px] font-mono mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="card p-5">
            <div className="text-accent text-xs font-mono uppercase tracking-widest mb-3 font-bold">
              01 · Risk Analysis
            </div>
            <div className="flex items-center gap-3 mb-3">
              <RiskBadge level={risk?.riskLevel || 'LOW'} />
            </div>
            <p className="text-text text-sm font-body leading-relaxed">
              {risk?.explanation || 'No active threats detected.'}
            </p>
          </div>

          {/* Affected Devices */}
          <div className="card p-5">
            <div className="text-accent text-xs font-mono uppercase tracking-widest mb-3 font-bold">
              02 · Affected Devices
            </div>
            {compromised.length === 0 ? (
              <div className="text-textDim text-xs font-mono">No compromised devices.</div>
            ) : (
              <div className="space-y-2">
                {compromised.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 bg-red/5 border border-red/20 rounded">
                    <span className="w-2 h-2 rounded-full bg-red animate-pulse flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-text text-sm font-mono">{d.name}</div>
                      <div className="text-textDim text-xs font-mono">{d.type} · {d.ip}</div>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {d.attackStages.map(s => (
                        <span key={s} className="text-[9px] font-mono text-red border border-red/30 px-1.5 py-0.5 rounded bg-red/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stage breakdown */}
          <div className="card p-5">
            <div className="text-accent text-xs font-mono uppercase tracking-widest mb-4 font-bold">
              03 · Attack Stage Timeline
            </div>
            {[
              { key: 'start', label: 'Initial Access', color: '#0ea5e9' },
              { key: 'escalate', label: 'Privilege Escalation', color: '#a855f7' },
              { key: 'move', label: 'Lateral Movement', color: '#ffd60a' },
              { key: 'exfiltrate', label: 'Data Exfiltration', color: '#ff3b3b' },
            ].map(s => {
              const count = risk?.stageBreakdown?.[s.key] || 0;
              const pct = devices.length ? Math.min((count / devices.length) * 100, 100) : 0;
              return (
                <div key={s.key} className="flex items-center gap-4 mb-3">
                  <div className="w-36 text-textDim text-xs font-mono flex-shrink-0">{s.label}</div>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                  <div className="text-xs font-mono flex-shrink-0" style={{ color: s.color }}>
                    {count}x
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent critical logs */}
          <div className="card p-5">
            <div className="text-accent text-xs font-mono uppercase tracking-widest mb-3 font-bold">
              04 · Critical Security Events
            </div>
            {critLogs.length === 0 ? (
              <div className="text-textDim text-xs font-mono">No critical events logged.</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {critLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-start gap-2 p-2 bg-red/5 border border-red/15 rounded">
                    <Badge type={log.type} />
                    <span className="text-red/80 text-xs font-mono flex-1 leading-relaxed">{log.message}</span>
                    <span className="text-textDim text-[10px] font-mono flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Download card */}
          <div className="card p-5 border-accent/20">
            <div className="text-accent text-xs font-mono uppercase tracking-widest mb-3">Export Report</div>
            <div className="space-y-3">
              <Button onClick={handleDownload} loading={generating} className="w-full justify-center" size="lg">
                ⬇ Download PDF
              </Button>
              <Button onClick={handleSend} loading={sending} variant="yellow" className="w-full justify-center" size="lg">
                ✉ Send to Org Head
              </Button>
            </div>
            <div className="mt-3 text-textDim text-[10px] font-mono leading-relaxed">
              PDF includes: device inventory, attack timeline, risk analysis, full event log, and recommendations.
            </div>
          </div>

          {/* Report metadata */}
          <div className="card p-4">
            <div className="text-textDim text-xs font-mono uppercase tracking-widest mb-3">Report Details</div>
            {[
              { label: 'Classification', val: 'INTERNAL' },
              { label: 'Format', val: 'PDF / A4' },
              { label: 'Recipient', val: 'dlinguberi@gmail.com' },
              { label: 'Platform', val: 'RedTeam Sim v1.0' },
              { label: 'Total Log Events', val: logs.length },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-textDim text-xs font-mono">{r.label}</span>
                <span className="text-text text-xs font-mono">{r.val}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="card p-4 border-yellow/20 bg-yellow/5">
            <div className="text-yellow text-xs font-mono uppercase tracking-wider mb-1 font-bold">⚠ Notice</div>
            <p className="text-textDim text-[10px] font-body leading-relaxed">
              This report is generated from a simulation environment. No real systems were compromised. For educational use only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}