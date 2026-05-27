// ── Shared reusable components ──────────────────────

export function Card({ children, className = '', glow = false }) {
  return (
    <div
      className={`card p-4 ${glow ? 'border-pulse' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ type }) {
  const styles = {
    CRITICAL: 'bg-red/20 text-red border-red/40 flicker',
    WARNING:  'bg-yellow/20 text-yellow border-yellow/40',
    SUCCESS:  'bg-accent/20 text-accent border-accent/40',
    INFO:     'bg-blue/20 text-blue border-blue/40',
    safe:        'bg-accent/20 text-accent border-accent/30',
    compromised: 'bg-red/20 text-red border-red/30',
    LOW:      'bg-accent/20 text-accent border-accent/40',
    MEDIUM:   'bg-yellow/20 text-yellow border-yellow/40',
    HIGH:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border tracking-widest ${styles[type] || 'bg-muted/20 text-textDim border-border'}`}
    >
      {type}
    </span>
  );
}

export function RiskBadge({ level }) {
  const map = {
    LOW:      { cls: 'bg-accent/15 text-accent border-accent/30', dot: 'bg-accent' },
    MEDIUM:   { cls: 'bg-yellow/15 text-yellow border-yellow/30', dot: 'bg-yellow' },
    HIGH:     { cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
    CRITICAL: { cls: 'bg-red/15 text-red border-red/30 flicker', dot: 'bg-red' },
  };
  const s = map[level] || map.LOW;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold border uppercase tracking-widest ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {level}
    </span>
  );
}

export function StatCard({ label, value, icon, color = 'accent', sub }) {
  const colors = {
    accent: 'text-accent',
    red:    'text-red',
    yellow: 'text-yellow',
    blue:   'text-blue',
  };
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-textDim text-xs font-mono uppercase tracking-widest">{label}</span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div className={`font-display text-3xl font-bold ${colors[color] || colors.accent}`}>
        {value ?? '—'}
      </div>
      {sub && <div className="text-textDim text-xs font-mono">{sub}</div>}
    </Card>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-xl font-bold text-text tracking-wide">{title}</h1>
        {subtitle && <p className="text-textDim text-sm font-body mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div className="bg-red/10 border border-red/30 rounded p-3 text-red text-sm font-mono">
      ⚠ {message}
    </div>
  );
}

export function EmptyState({ icon = '◫', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-textDim">
      <div className="text-4xl mb-3 opacity-30">{icon}</div>
      <div className="text-sm font-mono">{message}</div>
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, loading, className = '' }) {
  const base = 'inline-flex items-center gap-2 font-body font-medium rounded transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-base' };
  const variants = {
    primary: 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 hover:border-accent',
    danger:  'bg-red/20 text-red border border-red/40 hover:bg-red/30 hover:border-red',
    ghost:   'text-textDim border border-border hover:text-text hover:border-muted',
    yellow:  'bg-yellow/20 text-yellow border border-yellow/40 hover:bg-yellow/30',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

export function Table({ headers, children, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map(h => (
              <th key={h} className="text-left py-2 px-3 text-textDim font-mono text-xs uppercase tracking-widest font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty}
    </div>
  );
}
