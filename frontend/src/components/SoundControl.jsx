import { useState, useEffect } from 'react';
import { soundSettings, sounds } from '../utils/soundEngine';

export default function SoundControl() {
  const [enabled,    setEnabled]    = useState(soundSettings.isEnabled());
  const [volume,     setVolume]     = useState(soundSettings.getVolume());
  const [ambient,    setAmbient]    = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  // Sync settings into the engine whenever they change
  useEffect(() => {
    soundSettings.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    soundSettings.setVolume(volume);
  }, [volume]);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (!next) {
      sounds.ambient.stop();
      setAmbient(false);
    }
  };

  const handleAmbient = () => {
    if (!enabled) return;
    const running = sounds.ambient.toggle();
    setAmbient(running);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    // Play a test blip so user can hear the volume level
    sounds.click();
  };

  const handleTestSound = (soundFn, label) => {
    if (!enabled) return;
    soundFn();
  };

  const TEST_SOUNDS = [
    { label: 'Login',      fn: () => sounds.login()          },
    { label: 'Attack',     fn: () => sounds.attack()         },
    { label: 'Escalate',   fn: () => sounds.escalate()       },
    { label: 'Lateral',    fn: () => sounds.lateralMove()    },
    { label: 'Exfiltrate', fn: () => sounds.exfiltrate()     },
    { label: 'Critical',   fn: () => sounds.critical()       },
    { label: 'Warning',    fn: () => sounds.warning()        },
    { label: 'Success',    fn: () => sounds.success()        },
    { label: 'Reset',      fn: () => sounds.reset()          },
    { label: 'Report',     fn: () => sounds.reportGenerated()},
    { label: 'Email',      fn: () => sounds.emailSent()      },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Expanded panel */}
      {expanded && (
        <div
          className="card p-4 w-64 shadow-panel slide-in"
          style={{ background: '#0d1117', border: '1px solid #1e2d3d' }}
        >
          <div className="text-accent text-xs font-mono uppercase tracking-widest mb-3 font-bold">
            Sound Engine
          </div>

          {/* Master toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-textDim text-xs font-mono">Master Sound</span>
            <button
              onClick={handleToggle}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                enabled ? 'bg-accent/30 border border-accent/50' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  enabled ? 'left-5 bg-accent' : 'left-0.5 bg-muted'
                }`}
              />
            </button>
          </div>

          {/* Volume slider */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-textDim text-xs font-mono">Volume</span>
              <span className="text-accent text-xs font-mono">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!enabled}
              className="w-full h-1 rounded-full appearance-none cursor-pointer disabled:opacity-40"
              style={{
                background: `linear-gradient(to right, #00ff88 ${volume * 100}%, #1e2d3d ${volume * 100}%)`,
              }}
            />
          </div>

          {/* Ambient toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-textDim text-xs font-mono">Ambient Hum</span>
              <div className="text-[10px] font-mono text-border">Cyberpunk background drone</div>
            </div>
            <button
              onClick={handleAmbient}
              disabled={!enabled}
              className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-40 ${
                ambient ? 'bg-purple/30 border border-purple/50' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  ambient ? 'left-5 bg-purple' : 'left-0.5 bg-muted'
                }`}
                style={{ background: ambient ? '#a855f7' : undefined }}
              />
            </button>
          </div>

          {/* Test sounds grid */}
          <div className="border-t border-border pt-3">
            <div className="text-textDim text-[10px] font-mono uppercase tracking-widest mb-2">
              Test Sounds
            </div>
            <div className="grid grid-cols-3 gap-1">
              {TEST_SOUNDS.map(s => (
                <button
                  key={s.label}
                  onClick={() => handleTestSound(s.fn, s.label)}
                  disabled={!enabled}
                  className="px-2 py-1 text-[10px] font-mono text-textDim border border-border rounded hover:border-accent/40 hover:text-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => {
          setExpanded(e => !e);
          sounds.click();
        }}
        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-panel ${
          enabled
            ? 'bg-accent/10 border-accent/40 text-accent hover:bg-accent/20'
            : 'bg-surface border-border text-textDim hover:border-muted'
        }`}
        title={enabled ? 'Sound ON — Click to configure' : 'Sound OFF — Click to configure'}
      >
        {enabled ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      {/* Ambient indicator */}
      {ambient && enabled && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface border border-purple/30">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a855f7' }} />
          <span className="text-[9px] font-mono" style={{ color: '#a855f7' }}>AMBIENT</span>
        </div>
      )}
    </div>
  );
}
