import { useState, useEffect, useCallback } from 'react';
import { getDeviceStats, getSimStatus, getLogs, getRiskSummary, resetSimulation } from '../api/client';
import { StatCard, RiskBadge, Badge, Spinner, ErrorBox, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import Tooltip from '../components/Tooltip';

export default function DashboardPage() {
  const [stats,      setStats]      = useState(null);
  const [simStatus,  setSimStatus]  = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [riskSummary,setRiskSummary]= useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [resetting,  setResetting]  = useState(false);
  const [prevRisk,   setPrevRisk]   = useState(null);
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, simRes, logsRes, riskRes] = await Promise.all([
        getDeviceStats(),
        getSimStatus(),
        getLogs({ limit: 8 }),
        getRiskSummary(),
      ]);
      setStats(statsRes.data);
      setSimStatus(simRes.data);
      setRecentLogs(logsRes.data.logs);

      const newRisk = riskRes.data?.riskLevel;
      if (prevRisk && prevRisk !== newRisk) {
        if (newRisk === 'CRITICAL') sounds.critical();
        else if (newRisk === 'HIGH') sounds.warning();
      }
      setPrevRisk(newRisk);
      setRiskSummary(riskRes.data);
    } catch {
      setError('Failed to load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [prevRisk]);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 5000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const handleReset = async () => {
    if (!window.confirm('Reset the entire simulation? This will restore all devices to safe state.')) return;
    setResetting(true);
    try {
      await resetSimulation();
      sounds.reset();
      await fetchAll();
    } catch {
      sounds.warning();
      setError('Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  const go = (to) => { sounds.click(); navigate(to); };

  if (loading) return <Spinner />;
  if (error)   return <ErrorBox message={error} />;

  const riskColors = { LOW: 'accent', MEDIUM: 'yellow', HIGH: 'yellow', CRITICAL: 'red' };

  return (
    <div className="space-y-6 slide-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold text-text tracking-wide">C2 DASHBOARD</h1>
          <Tooltip
            text="The Command & Control dashboard shows you a real-time overview of your simulation — which devices are safe, which are compromised, and the current threat risk level."
            position="right"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { sounds.click(); fetchAll(); }} variant="ghost" size="sm">↻ Refresh</Button>
          <Button onClick={handleReset} variant="danger" size="sm" loading={resetting}>⟳ Reset Sim</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Devices"  value={stats?.total}       icon="⬟" color="accent" sub="In inventory" />
        <StatCard label="Compromised"    value={stats?.compromised}  icon="◉" color="red"    sub="Active threats" />
        <StatCard label="Safe Devices"   value={stats?.safe}         icon="✓" color="accent" sub="Unaffected" />
        <StatCard
          label="Risk Level"
          value={<RiskBadge level={stats?.riskLevel || 'LOW'} />}
          icon="⚡"
          color={riskColors[stats?.riskLevel] || 'accent'}
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk panel */}
        <div className="card p-5 lg:col-span-2">
          <div className="text-textDim text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI Risk Analysis
            <Tooltip
              text="The AI Risk Engine analyzes all attack activity across your devices and calculates a threat level from LOW to CRITICAL. It explains its reasoning in plain English below."
              position="bottom"
            />
          </div>
          <RiskBadge level={riskSummary?.riskLevel || 'LOW'} />
          <p className="text-text text-sm font-body mt-3 leading-relaxed">
            {riskSummary?.explanation || 'No active threats detected.'}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-surface rounded p-3 border border-border">
              <div className="text-textDim text-xs font-mono">Critical Events</div>
              <div className="text-red font-display text-xl font-bold">{riskSummary?.criticalEvents || 0}</div>
            </div>
            <div className="bg-surface rounded p-3 border border-border">
              <div className="text-textDim text-xs font-mono">Attack Stages Run</div>
              <div className="text-yellow font-display text-xl font-bold">{simStatus?.attackStagesExecuted || 0}</div>
            </div>
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="card p-5">
          <div className="flex items-center gap-2 text-textDim text-xs font-mono uppercase tracking-widest mb-3">
            Stage Breakdown
            <Tooltip
              text="Shows how many times each attack stage has been executed across all devices. A full chain (start → escalate → move → exfiltrate) represents a complete attack scenario."
              position="left"
            />
          </div>
          {[
            { key: 'start',      label: 'Initial Access',  color: '#0ea5e9' },
            { key: 'escalate',   label: 'Priv Escalation', color: '#a855f7' },
            { key: 'move',       label: 'Lateral Move',    color: '#ffd60a' },
            { key: 'exfiltrate', label: 'Exfiltration',    color: '#ff3b3b' },
          ].map(s => {
            const count = riskSummary?.stageBreakdown?.[s.key] || 0;
            const max   = stats?.total || 1;
            const pct   = Math.min((count / max) * 100, 100);
            return (
              <div key={s.key} className="mb-3">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-textDim">{s.label}</span>
                  <span style={{ color: s.color }}>{count}x</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent logs + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-textDim text-xs font-mono uppercase tracking-widest">Recent Events</span>
              <Tooltip
                text="Security events are generated automatically as the simulation runs. Each entry shows what happened, how severe it is (INFO/WARNING/CRITICAL), and when it occurred."
                position="right"
              />
            </div>
            <Button onClick={() => go('/logs')} variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentLogs.length === 0 && (
              <div className="text-textDim text-xs font-mono py-4 text-center">No events yet. Run a simulation to generate events.</div>
            )}
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2 p-2 rounded bg-surface border border-border log-entry">
                <Badge type={log.type} />
                <span className="text-text text-xs font-mono flex-1 leading-relaxed">{log.message}</span>
                <span className="text-textDim text-[10px] font-mono flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-textDim text-xs font-mono uppercase tracking-widest mb-3">Quick Actions</div>
          <div className="space-y-2">
            {[
              { label: 'Run Simulation',  to: '/simulation', variant: 'danger',  icon: '◉' },
              { label: 'View Devices',    to: '/devices',    variant: 'primary', icon: '⬟' },
              { label: 'Security Logs',   to: '/logs',       variant: 'ghost',   icon: '≡' },
              { label: 'Generate Report', to: '/reports',    variant: 'yellow',  icon: '◫' },
            ].map(a => (
              <Button key={a.label} onClick={() => go(a.to)} variant={a.variant} className="w-full justify-start">
                <span>{a.icon}</span>{a.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}