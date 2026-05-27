import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TOUR_STEPS = [
  {
    title: 'Welcome to RedTeam Platform! 👋',
    icon: '⬡',
    content:
      'This platform lets you simulate real-world cyberattacks in a completely safe environment. ' +
      'No real systems are harmed — everything runs in memory as a demonstration.',
    highlight: null,
    action: null,
  },
  {
    title: 'Step 1 — Dashboard',
    icon: '◈',
    content:
      'The Dashboard is your command center. It shows you how many devices are in the simulation, ' +
      'which ones have been compromised, and the current threat risk level (LOW → CRITICAL).',
    highlight: '/dashboard',
    action: { label: 'Go to Dashboard', to: '/dashboard' },
  },
  {
    title: 'Step 2 — Add Devices',
    icon: '⬟',
    content:
      'Devices are the computers, servers, and databases in your simulated network. ' +
      'Go to the Devices page and add a few. These will be the targets of the attack simulation.',
    highlight: '/devices',
    action: { label: 'Go to Devices', to: '/devices' },
  },
  {
    title: 'Step 3 — Run the Attack',
    icon: '◉',
    content:
      'The Simulation page lets you execute a 4-stage cyberattack: ' +
      '(1) Initial Access → (2) Privilege Escalation → (3) Lateral Movement → (4) Data Exfiltration. ' +
      'Select a device and click through each stage.',
    highlight: '/simulation',
    action: { label: 'Go to Simulation', to: '/simulation' },
  },
  {
    title: 'Step 4 — View Security Logs',
    icon: '≡',
    content:
      'Every action generates a security event log. The Logs page shows all events in real time ' +
      'with severity levels: INFO, SUCCESS, WARNING, and CRITICAL. ' +
      'Watch the CRITICAL alerts appear as the attack progresses.',
    highlight: '/logs',
    action: { label: 'Go to Logs', to: '/logs' },
  },
  {
    title: 'Step 5 — Generate a Report',
    icon: '◫',
    content:
      'When the simulation is complete, go to Reports to generate a professional PDF report. ' +
      'It includes the full attack timeline, device status, risk analysis, and security recommendations. ' +
      'You can also email it directly to the organization head.',
    highlight: '/reports',
    action: { label: 'Go to Reports', to: '/reports' },
  },
  {
    title: "You're ready! 🚀",
    icon: '✓',
    content:
      'That covers the full platform. Remember: click the ℹ icons throughout the app for quick ' +
      'explanations of any feature. You can also visit the Help page anytime from the sidebar.',
    highlight: null,
    action: null,
  },
];

const TOUR_KEY = 'rt_tour_completed';

export default function GuidedTour({ forceShow = false, onClose }) {
  const [step,    setStep]    = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show automatically on first login, or when forceShow is true
    const done = localStorage.getItem(TOUR_KEY);
    if (forceShow || !done) setVisible(true);
  }, [forceShow]);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast  = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) return handleClose();
    setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => Math.max(0, s - 1));

  const handleClose = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setVisible(false);
    onClose?.();
  };

  const handleNavigate = (to) => {
    if (to) navigate(to);
    handleNext();
  };

  return (
    // Overlay — semi-transparent, doesn't fully block UI
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(8,12,16,0.85)' }}>

      <div
        className="w-full max-w-md card border-accent/30 overflow-hidden"
        style={{ background: '#0d1117', boxShadow: '0 0 40px rgba(0,255,136,0.15)' }}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-accent w-full" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-accent/40 bg-accent/10 flex items-center justify-center text-accent text-xl">
              {current.icon}
            </div>
            <div>
              <div className="text-[10px] font-mono text-textDim uppercase tracking-widest mb-0.5">
                Step {step + 1} of {TOUR_STEPS.length}
              </div>
              <h2 className="font-display text-base font-bold text-text">
                {current.title}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-textDim hover:text-text text-lg leading-none transition-colors mt-1 flex-shrink-0"
            title="Skip tour"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-4">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: i <= step ? '#00ff88' : '#1e2d3d' }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          <p className="text-text text-sm font-body leading-relaxed">
            {current.content}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          {/* Previous */}
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="px-3 py-2 text-xs font-mono text-textDim border border-border rounded
                       hover:text-text hover:border-muted disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {/* Navigate to page button */}
            {current.action && (
              <button
                onClick={() => handleNavigate(current.action.to)}
                className="px-3 py-2 text-xs font-mono text-accent border border-accent/40
                           bg-accent/10 rounded hover:bg-accent/20 transition-all"
              >
                {current.action.label} →
              </button>
            )}

            {/* Next / Finish */}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-display font-bold tracking-wide text-bg rounded transition-all"
              style={{ background: '#00ff88' }}
            >
              {isLast ? 'Get Started ✓' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Skip link */}
        {!isLast && (
          <div className="px-5 pb-4 text-center">
            <button
              onClick={handleClose}
              className="text-textDim text-[10px] font-mono hover:text-text transition-colors underline"
            >
              Skip tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the key so WelcomePage can trigger the tour
export { TOUR_KEY };
