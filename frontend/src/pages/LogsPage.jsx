import { useState, useEffect, useCallback, useRef } from 'react';
import { getLogs, clearLogs } from '../api/client';
import { SectionHeader, Badge, Spinner, ErrorBox, Button, EmptyState } from '../components/UI';
import { sounds } from '../utils/soundEngine';

const LOG_TYPES = ['ALL', 'CRITICAL', 'WARNING', 'SUCCESS', 'INFO'];

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const prevLogCountRef = useRef(0);

  const fetchLogs = useCallback(async () => {
    try {
      const params = filter !== 'ALL' ? { type: filter } : {};
      const res = await getLogs(params);
      const newLogs = res.data.logs;

      // Play sound for new log entries since last poll
      if (prevLogCountRef.current > 0 && newLogs.length > prevLogCountRef.current) {
        const newestLog = newLogs[0];
        sounds.logEntry(newestLog?.type || 'INFO');
      }
      prevLogCountRef.current = newLogs.length;

      setLogs(newLogs);
    } catch {
      setError('Failed to fetch logs.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(fetchLogs, 3000);
    return () => clearInterval(iv);
  }, [fetchLogs, autoRefresh]);

  const handleClear = async () => {
    if (!window.confirm('Clear all logs? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clearLogs();
      sounds.click();
      await fetchLogs();
    } catch {
      sounds.warning();
      setError('Failed to clear logs.');
    } finally {
      setClearing(false);
    }
  };

  const handleToggleLive = () => {
    sounds.click();
    setAutoRefresh(a => !a);
  };

  const handleFilterChange = (t) => {
    sounds.click();
    setFilter(t);
  };

  const counts = logs.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 slide-in">
      <SectionHeader
        title="SECURITY EVENT LOGS"
        subtitle="Structured event log stream from the simulation engine"
        action={
          <div className="flex gap-2">
            <Button
              onClick={handleToggleLive}
              variant={autoRefresh ? 'primary' : 'ghost'}
              size="sm"
            >
              {autoRefresh ? '⏸ Pause' : '▶ Live'}
            </Button>
            <Button onClick={() => { sounds.click(); fetchLogs(); }} variant="ghost" size="sm">↻ Refresh</Button>
            <Button onClick={handleClear} variant="danger" size="sm" loading={clearing}>✕ Clear</Button>
          </div>
        }
      />

      {error && <ErrorBox message={error} />}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { type: 'CRITICAL', color: 'text-red', bg: 'bg-red/10 border-red/20' },
          { type: 'WARNING',  color: 'text-yellow', bg: 'bg-yellow/10 border-yellow/20' },
          { type: 'SUCCESS',  color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
          { type: 'INFO',     color: 'text-blue', bg: 'bg-blue/10 border-blue/20' },
        ].map(s => (
          <div key={s.type} className={`card p-3 border text-center ${s.bg}`}>
            <div className={`font-display text-2xl font-bold ${s.color}`}>{counts[s.type] || 0}</div>
            <div className="text-textDim text-xs font-mono">{s.type}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {LOG_TYPES.map(t => (
          <button
            key={t}
            onClick={() => handleFilterChange(t)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              filter === t
                ? 'bg-accent/20 text-accent border-accent/40'
                : 'text-textDim border-border hover:text-text hover:border-muted'
            }`}
          >
            {t} {t !== 'ALL' && counts[t] ? `(${counts[t]})` : ''}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          {autoRefresh && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
          <span className="text-textDim text-xs font-mono">
            {autoRefresh ? 'Live' : 'Paused'} · {logs.length} events
          </span>
        </div>
      </div>

      {/* Log stream */}
      <div className="card overflow-hidden">
        <div className="p-3 border-b border-border bg-bg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-textDim text-xs font-mono">Event Stream</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <Spinner />
          ) : logs.length === 0 ? (
            <EmptyState icon="≡" message="No log entries. Run a simulation to generate events." />
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log, i) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 transition-colors log-entry ${
                    log.type === 'CRITICAL' ? 'bg-red/5 hover:bg-red/8' : 'hover:bg-surface'
                  }`}
                >
                  {/* Line number */}
                  <span className="text-[10px] font-mono text-border w-6 flex-shrink-0 pt-0.5 text-right">
                    {logs.length - i}
                  </span>
                  {/* Badge */}
                  <div className="flex-shrink-0 pt-0.5">
                    <Badge type={log.type} />
                  </div>
                  {/* Timestamp */}
                  <span className="text-textDim text-[10px] font-mono flex-shrink-0 pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {/* Message */}
                  <span className={`text-xs font-mono flex-1 leading-relaxed ${
                    log.type === 'CRITICAL' ? 'text-red/90' :
                    log.type === 'WARNING'  ? 'text-yellow/90' :
                    log.type === 'SUCCESS'  ? 'text-accent/90' :
                    'text-text/80'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}