import { useNavigate } from 'react-router-dom';
import { TOUR_KEY } from '../components/GuidedTour';

const SECTIONS = [
  {
    id: 'what',
    icon: '⬡',
    title: 'What Is This Platform?',
    content: `The AI-Assisted Red Team Simulation Platform is an educational cybersecurity tool 
    that simulates how real-world cyberattacks happen — step by step — in a completely safe environment.
    Nothing here attacks real systems. All devices, logs, and attack data exist only in memory on your computer.
    The goal is to help students, security teams, and evaluators understand how attackers think and operate.`,
  },
  {
    id: 'dashboard',
    icon: '◈',
    title: 'Dashboard',
    content: `The Dashboard is your command and control center (C2). It gives you a real-time overview of:
    • How many devices are in the simulation
    • How many have been compromised (attacked)
    • The current threat risk level (LOW, MEDIUM, HIGH, or CRITICAL)
    • A live feed of the most recent security events
    The AI Risk Engine analyzes all attack activity and automatically updates the risk level with a plain-English explanation.`,
  },
  {
    id: 'devices',
    icon: '⬟',
    title: 'Devices',
    content: `Devices represent the computers, servers, and databases in your simulated network. 
    Think of them like the targets in a real attack scenario. You can:
    • Add devices of different types (Server, PC, Database, Router, Firewall)
    • Give them custom names and IP addresses
    • See which ones have been attacked and what stages were executed against them
    In real cybersecurity, these would represent actual machines on a corporate network.`,
  },
  {
    id: 'simulation',
    icon: '◉',
    title: 'Attack Simulation',
    content: `The Simulation page is where the action happens. You execute a 4-stage cyberattack against your devices.
    Each stage must be run in order — just like a real attacker would operate:`,
  },
];

const ATTACK_STAGES = [
  {
    stage: '01',
    name: 'Initial Access',
    color: '#0ea5e9',
    real: 'Attacker sends a phishing email or exploits a public-facing app.',
    sim:  'Platform marks the device as compromised and creates a simulated backdoor connection.',
  },
  {
    stage: '02',
    name: 'Privilege Escalation',
    color: '#a855f7',
    real: 'Attacker exploits a software bug to gain admin/root access on the machine.',
    sim:  'Platform simulates a local exploit and grants the attacker SYSTEM-level privileges.',
  },
  {
    stage: '03',
    name: 'Lateral Movement',
    color: '#ffd60a',
    real: 'Attacker uses stolen credentials to move from one machine to another inside the network.',
    sim:  'Platform marks a second device as compromised and logs the pivot between machines.',
  },
  {
    stage: '04',
    name: 'Data Exfiltration',
    color: '#ff3b3b',
    real: 'Attacker packages up sensitive data (passwords, customer records, source code) and sends it out.',
    sim:  'Platform generates a simulated data theft event and triggers a CRITICAL risk alert.',
  },
];

const FEATURES = [
  { icon: '≡', name: 'Security Logs', desc: 'A real-time stream of all events. Each entry has a severity: INFO (normal activity), SUCCESS (completed action), WARNING (suspicious activity), CRITICAL (active attack).' },
  { icon: '◫', name: 'Reports', desc: 'Generate a professional PDF security assessment report. Includes device inventory, attack timeline, risk score, and all event logs. Can be emailed to a specified recipient.' },
  { icon: '🔊', name: 'Sound Engine', desc: 'Each action plays a matching sound — login chimes, attack alerts, critical alarms. Use the speaker icon (bottom right) to adjust or disable sounds.' },
  { icon: '⟳', name: 'Reset', desc: 'The Reset button on the Dashboard or Simulation page restores all devices to their safe state and clears all logs. Useful for running multiple demos.' },
];

const RISK_LEVELS = [
  { level: 'LOW',      color: '#00ff88', desc: 'No attacks detected. All devices are operating normally.' },
  { level: 'MEDIUM',   color: '#ffd60a', desc: 'One or more devices have been compromised.' },
  { level: 'HIGH',     color: '#ff7800', desc: 'Privilege escalation and lateral movement detected, OR more than half of devices compromised.' },
  { level: 'CRITICAL', color: '#ff3b3b', desc: 'Data exfiltration is in progress, or multiple severe events logged. Immediate action required.' },
];

export default function HelpPage() {
  const navigate = useNavigate();

  const restartTour = () => {
    localStorage.removeItem(TOUR_KEY);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 slide-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-text tracking-wide">HELP & PLATFORM GUIDE</h1>
          <p className="text-textDim text-sm font-body mt-1">
            Everything you need to know about the RedTeam Simulation Platform
          </p>
        </div>
        <button
          onClick={restartTour}
          className="px-3 py-2 text-xs font-mono text-accent border border-accent/40 bg-accent/10
                     rounded hover:bg-accent/20 transition-all flex-shrink-0"
        >
          ▶ Restart Tour
        </button>
      </div>

      {/* What is this */}
      {SECTIONS.slice(0, 1).map(s => (
        <div key={s.id} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl text-accent">{s.icon}</span>
            <h2 className="font-display text-base font-bold text-text">{s.title}</h2>
          </div>
          <p className="text-text text-sm font-body leading-relaxed">{s.content}</p>
          <div className="mt-4 p-3 bg-yellow/5 border border-yellow/20 rounded">
            <span className="text-yellow text-xs font-mono font-bold">⚠ Important: </span>
            <span className="text-textDim text-xs font-body">
              This is a simulation only. No real computers are attacked. No real data is stolen.
              Everything runs safely inside your browser and local server.
            </span>
          </div>
        </div>
      ))}

      {/* Feature sections */}
      {SECTIONS.slice(1, 3).map(s => (
        <div key={s.id} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl text-accent">{s.icon}</span>
            <h2 className="font-display text-base font-bold text-text">{s.title}</h2>
          </div>
          <div className="text-text text-sm font-body leading-relaxed whitespace-pre-line">{s.content}</div>
        </div>
      ))}

      {/* Attack stages */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl text-accent">◉</span>
          <h2 className="font-display text-base font-bold text-text">Attack Simulation — The 4 Stages</h2>
        </div>
        <p className="text-textDim text-sm font-body mb-5">
          A cyberattack doesn't happen all at once. Real attackers follow a sequence of steps called the
          "attack kill chain." Here's what each stage means in simple terms:
        </p>
        <div className="space-y-4">
          {ATTACK_STAGES.map((s, i) => (
            <div key={s.stage} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border"
                style={{ background: `${s.color}10` }}>
                <div className="font-display text-xs font-bold opacity-50" style={{ color: s.color }}>
                  STAGE {s.stage}
                </div>
                <div className="font-display text-sm font-bold" style={{ color: s.color }}>{s.name}</div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-textDim text-[10px] font-mono uppercase tracking-widest mb-1">In Real Life</div>
                  <div className="text-text text-xs font-body leading-relaxed">{s.real}</div>
                </div>
                <div>
                  <div className="text-accent text-[10px] font-mono uppercase tracking-widest mb-1">In This Simulation</div>
                  <div className="text-text text-xs font-body leading-relaxed">{s.sim}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk levels */}
      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-text mb-4">Risk Level Explained</h2>
        <div className="space-y-3">
          {RISK_LEVELS.map(r => (
            <div key={r.level} className="flex items-start gap-4 p-3 rounded border border-border">
              <div className="flex-shrink-0">
                <span
                  className="inline-block px-2.5 py-1 rounded text-xs font-display font-bold tracking-widest"
                  style={{ color: r.color, background: `${r.color}15`, border: `1px solid ${r.color}40` }}
                >
                  {r.level}
                </span>
              </div>
              <p className="text-text text-sm font-body leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Other features */}
      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-text mb-4">Other Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div key={f.name} className="p-4 bg-surface border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-accent text-lg">{f.icon}</span>
                <span className="font-display text-xs font-bold text-text">{f.name}</span>
              </div>
              <p className="text-textDim text-xs font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick start */}
      <div className="card p-6 border-accent/20" style={{ background: 'linear-gradient(135deg,#080c10,#0d1117)' }}>
        <h2 className="font-display text-base font-bold text-accent mb-3">Quick Start Guide</h2>
        <ol className="space-y-2">
          {[
            'Log in → you land on the Welcome page',
            'Go to Devices → add 2–3 devices',
            'Go to Simulation → select a device, run all 4 attack stages',
            'Go to Dashboard → watch the risk level change to CRITICAL',
            'Go to Logs → see the full event stream',
            'Go to Reports → download the PDF',
            'Hit Reset Simulation to start over for another demo',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-body text-text">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 border border-accent/40
                               text-accent text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <button
          onClick={restartTour}
          className="mt-5 px-4 py-2 text-xs font-display font-bold tracking-widest text-bg rounded transition-all"
          style={{ background: '#00ff88' }}
        >
          ▶ Take the Guided Tour
        </button>
      </div>
    </div>
  );
}
