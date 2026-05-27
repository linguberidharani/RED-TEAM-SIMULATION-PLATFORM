import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { icon: '◉', title: 'Attack Simulation Engine', desc: 'Execute multi-stage cyberattack scenarios: initial access, privilege escalation, lateral movement, and data exfiltration — all safely simulated.' },
  { icon: '◈', title: 'C2 Command Dashboard', desc: 'Central command & control panel. Monitor all devices, track compromise status, and observe risk levels in real-time.' },
  { icon: '⬟', title: 'AI Risk Engine', desc: 'Rule-based intelligence analyzes attack patterns and classifies threat levels from LOW to CRITICAL with plain-English explanations.' },
  { icon: '◫', title: 'Automated PDF Reports', desc: 'One-click report generation with full attack timelines, device status, log summaries, and risk assessments ready to share.' },
  { icon: '≡', title: 'Security Event Logs', desc: 'Structured event logging with INFO, SUCCESS, WARNING, and CRITICAL severity levels with full filtering support.' },
  { icon: '⬡', title: 'Attack Flow Visualization', desc: 'Visual network topology showing device relationships, compromise paths, and lateral movement flows.' },
];

const STAGES = [
  { num: '01', label: 'Initial Access', color: '#0ea5e9', desc: 'Phishing / backdoor shell' },
  { num: '02', label: 'Privilege Escalation', color: '#a855f7', desc: 'Root / SYSTEM access' },
  { num: '03', label: 'Lateral Movement', color: '#ffd60a', desc: 'Network pivot' },
  { num: '04', label: 'Data Exfiltration', color: '#ff3b3b', desc: 'Data theft simulation' },
];

export default function WelcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-12 slide-in">
      {/* Hero */}
      <div className="relative rounded-lg overflow-hidden border border-border p-10 text-center"
        style={{ background: 'linear-gradient(135deg, #090e14 0%, #0d1117 50%, #090e14 100%)' }}>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="absolute top-0 left-0 w-32 h-32 rounded-br-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00ff88, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff3b3b, transparent)' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-accent font-mono text-xs tracking-widest">SIMULATION MODE ACTIVE</span>
          </div>
          <h1 className="font-display text-4xl font-black text-text tracking-wide mb-3">
            AI-ASSISTED<br />
            <span className="text-accent glow-text">RED TEAM</span> SIMULATION
          </h1>
          <p className="text-textDim font-body max-w-xl mx-auto leading-relaxed mb-8">
            A unified platform for simulating multi-stage cyberattacks, monitoring threat propagation,
            and generating executive-grade security reports — all in a safe, controlled environment.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded font-display text-sm font-bold tracking-widest text-bg transition-all hover:scale-105"
              style={{ background: '#00ff88' }}
            >
              OPEN DASHBOARD
            </button>
            <button
              onClick={() => navigate('/simulation')}
              className="px-6 py-3 rounded font-display text-sm font-bold tracking-widest text-red border border-red/40 bg-red/10 hover:bg-red/20 transition-all"
            >
              START SIMULATION
            </button>
          </div>
          <p className="text-textDim text-xs font-mono mt-4">
            Welcome back, <span className="text-accent">{user?.name}</span> — Role: <span className="text-accent">{user?.role?.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* Attack stages */}
      <div>
        <h2 className="font-display text-sm font-bold text-textDim tracking-widest uppercase mb-4">
          Attack Kill Chain
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STAGES.map((s, i) => (
            <div key={s.num}
              className="card p-4 relative overflow-hidden hover:border-opacity-60 transition-all"
              style={{ borderColor: s.color + '40' }}>
              <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-10"
                style={{ background: s.color }} />
              <div className="font-display text-xs font-bold opacity-40 mb-2" style={{ color: s.color }}>
                STAGE {s.num}
              </div>
              <div className="font-body font-semibold text-text text-sm mb-1">{s.label}</div>
              <div className="text-textDim text-xs font-mono">{s.desc}</div>
              {i < STAGES.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 z-10 text-border text-lg">›</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="font-display text-sm font-bold text-textDim tracking-widest uppercase mb-4">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-4 hover:border-accent/20 transition-all group">
              <div className="text-accent text-xl mb-3 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </div>
              <h3 className="font-display text-sm font-bold text-text mb-2">{f.title}</h3>
              <p className="text-textDim text-xs font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 border-yellow/20 bg-yellow/5">
        <div className="flex items-start gap-3">
          <span className="text-yellow text-lg flex-shrink-0">⚠</span>
          <div>
            <div className="text-yellow font-display text-xs font-bold tracking-wider mb-1">
              EDUCATIONAL SIMULATION ONLY
            </div>
            <p className="text-textDim text-xs font-body leading-relaxed">
              This platform is a safe, educational simulation. No real exploits, malware, or network attacks are performed.
              All attack stages are simulated in-memory for demonstration and learning purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
