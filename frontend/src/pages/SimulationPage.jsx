import { useState, useEffect, useCallback } from 'react';
import { getDevices, startAttack, escalateAttack, moveAttack, exfiltrateAttack, resetSimulation } from '../api/client';
import { SectionHeader, Badge, RiskBadge, Spinner, ErrorBox, Button } from '../components/UI';
import NetworkGraph from '../components/NetworkGraph';
import { sounds, attackSound } from '../utils/soundEngine';

const STAGES = [
  {
    id: 'start',
    label: 'Initial Access',
    icon: '◎',
    color: '#0ea5e9',
    desc: 'Deploy phishing payload and establish backdoor shell on target device.',
    btnLabel: 'Execute Initial Access',
    variant: 'ghost',
    requiredStage: null,
  },
  {
    id: 'escalate',
    label: 'Privilege Escalation',
    icon: '▲',
    color: '#a855f7',
    desc: 'Exploit local vulnerability to elevate from user to SYSTEM/root privileges.',
    btnLabel: 'Escalate Privileges',
    variant: 'ghost',
    requiredStage: 'start',
  },
  {
    id: 'move',
    label: 'Lateral Movement',
    icon: '→',
    color: '#ffd60a',
    desc: 'Pivot from compromised host to additional network targets using stolen credentials.',
    btnLabel: 'Pivot Laterally',
    variant: 'yellow',
    requiredStage: 'escalate',
  },
  {
    id: 'exfiltrate',
    label: 'Data Exfiltration',
    icon: '⬆',
    color: '#ff3b3b',
    desc: 'Stage and exfiltrate sensitive data via encrypted tunnel to external C2.',
    btnLabel: 'Exfiltrate Data',
    variant: 'danger',
    requiredStage: 'start',
  },
];

export default function SimulationPage() {
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [resetting, setResetting] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await getDevices();
      setDevices(res.data.devices);
      if (!selectedId && res.data.devices.length > 0) {
        setSelectedId(res.data.devices[0].id);
      }
    } catch {
      setError('Failed to load devices.');
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const selected = devices.find(d => d.id === selectedId);

  const canExecuteStage = (stage) => {
    if (!selected) return false;
    if (selected.attackStages.includes(stage.id)) return false;
    if (stage.requiredStage && !selected.attackStages.includes(stage.requiredStage)) return false;
    return true;
  };

  const runStage = async (stageId) => {
    setError('');
    setFeedback(null);
    setActionLoading(stageId);

    // Play the matching attack sound immediately on click
    attackSound[stageId]?.();

    try {
      let res;
      if (stageId === 'start')      res = await startAttack(selectedId);
      if (stageId === 'escalate')   res = await escalateAttack(selectedId);
      if (stageId === 'move')       res = await moveAttack(selectedId);
      if (stageId === 'exfiltrate') res = await exfiltrateAttack(selectedId);

      // Success notification after response
      setTimeout(() => sounds.notification(), 300);

      setFeedback({
        type: 'success',
        stage: stageId,
        message: res.data.logs?.[res.data.logs.length - 1]?.message || 'Stage executed.',
        risk: res.data.risk,
        stolenData: res.data.stolenData,
      });
      await fetchDevices();
    } catch (err) {
      sounds.warning();
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Attack stage failed.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset simulation? All devices will be restored to safe state.')) return;
    setResetting(true);
    setFeedback(null);
    try {
      await resetSimulation();
      sounds.reset();
      await fetchDevices();
      setFeedback({ type: 'info', message: 'Simulation reset. All devices restored to baseline.' });
    } catch {
      sounds.warning();
      setError('Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  const handleSelectDevice = (id) => {
    sounds.click();
    setSelectedId(id);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 slide-in">
      <SectionHeader
        title="ATTACK SIMULATION ENGINE"
        subtitle="Execute multi-stage cyberattack scenarios against simulated targets"
        action={
          <Button onClick={handleReset} variant="danger" size="sm" loading={resetting}>
            ⟳ Reset Simulation
          </Button>
        }
      />

      {error && <ErrorBox message={error} />}

      {/* Feedback banner */}
      {feedback && (
        <div className={`card p-4 log-entry border ${
          feedback.type === 'error'   ? 'border-red/40 bg-red/5' :
          feedback.type === 'success' ? 'border-accent/30 bg-accent/5' :
                                        'border-blue/30 bg-blue/5'
        }`}>
          <div className="flex items-start gap-3">
            <span className={`text-xl ${
              feedback.type === 'error' ? 'text-red' : feedback.type === 'success' ? 'text-accent' : 'text-blue'
            }`}>
              {feedback.type === 'error' ? '⚠' : feedback.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <div className="flex-1">
              <div className="text-text text-sm font-mono">{feedback.message}</div>
              {feedback.risk && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-textDim text-xs font-mono">Risk updated:</span>
                  <RiskBadge level={feedback.risk.riskLevel} />
                </div>
              )}
              {feedback.stolenData && (
                <div className="mt-1 text-red text-xs font-mono">⬆ Data stolen: {feedback.stolenData}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Target selection */}
        <div className="space-y-4">
          <div className="card p-4">
            <label className="block text-textDim text-xs font-mono uppercase tracking-widest mb-3">
              Select Target Device
            </label>
            <div className="space-y-2">
              {devices.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDevice(d.id)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    selectedId === d.id
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-border bg-surface hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-text font-mono text-sm">{d.name}</div>
                      <div className="text-textDim text-xs font-mono">{d.type} · {d.ip}</div>
                    </div>
                    <Badge type={d.status} />
                  </div>
                  {d.attackStages.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {d.attackStages.map(s => (
                        <span key={s} className="text-[9px] font-mono bg-red/10 text-red px-1.5 py-0.5 rounded border border-red/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Attack stages + visualization */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stage cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STAGES.map(stage => {
              const canRun = canExecuteStage(stage);
              const alreadyDone = selected?.attackStages.includes(stage.id);
              const isRunning = actionLoading === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`card p-4 transition-all border ${
                    alreadyDone ? 'border-red/30 bg-red/5' :
                    canRun     ? 'border-border hover:border-opacity-60' :
                                 'border-border opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" style={{ color: stage.color }}>{stage.icon}</span>
                      <span className="font-display text-xs font-bold text-text">{stage.label}</span>
                    </div>
                    {alreadyDone && (
                      <span className="text-[9px] font-mono text-red border border-red/30 px-1.5 py-0.5 rounded bg-red/10">
                        EXECUTED
                      </span>
                    )}
                  </div>
                  <p className="text-textDim text-xs font-body leading-relaxed mb-3">{stage.desc}</p>
                  <Button
                    onClick={() => runStage(stage.id)}
                    disabled={!canRun || alreadyDone}
                    loading={isRunning}
                    variant={alreadyDone ? 'ghost' : stage.variant}
                    size="sm"
                    className="w-full justify-center"
                  >
                    {alreadyDone ? '✓ Done' : stage.btnLabel}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Network visualization */}
          <div className="card p-4">
            <div className="text-textDim text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Live Network Topology
            </div>
            {devices.length === 0 ? (
              <div className="text-center text-textDim text-xs font-mono py-8">
                No devices to visualize. Add devices first.
              </div>
            ) : (
              <NetworkGraph devices={devices} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}