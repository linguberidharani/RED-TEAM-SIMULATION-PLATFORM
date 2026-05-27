/**
 * soundEngine.js
 * ─────────────────────────────────────────────────────────────
 * All sounds are generated programmatically using the Web Audio API.
 * No audio files, no external libraries, no dependencies.
 *
 * Usage:
 *   import { sounds, useSoundEngine } from '../utils/soundEngine';
 *
 *   sounds.login();
 *   sounds.attack();
 *   sounds.critical();
 *   sounds.success();
 *   sounds.reset();
 *   sounds.keystroke();
 *   sounds.notification();
 *   sounds.ambient.start();
 *   sounds.ambient.stop();
 */

// ── Audio context (lazy-created on first user interaction) ─────
let _ctx = null;

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
}

// ── Master volume (0–1) — user can adjust ─────────────────────
let _masterVolume = 0.4;
let _enabled = true;

export const soundSettings = {
  setVolume(v)   { _masterVolume = Math.max(0, Math.min(1, v)); },
  getVolume()    { return _masterVolume; },
  setEnabled(v)  { _enabled = v; if (!v) sounds.ambient.stop(); },
  isEnabled()    { return _enabled; },
  toggle()       { soundSettings.setEnabled(!_enabled); return _enabled; },
};

// ── Core helper: create a gain node connected to destination ───
function masterGain(volume = 1) {
  const ctx = getCtx();
  const g = ctx.createGain();
  g.gain.setValueAtTime(_masterVolume * volume, ctx.currentTime);
  g.connect(ctx.destination);
  return g;
}

// ── Envelope helper: attack → sustain → release ───────────────
function envelope(gainNode, { attack = 0.01, sustain = 0.3, release = 0.3, peak = 1 } = {}) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(peak * _masterVolume, now + attack);
  gainNode.gain.setValueAtTime(peak * _masterVolume, now + attack + sustain);
  gainNode.gain.linearRampToValueAtTime(0, now + attack + sustain + release);
}

// ── Oscillator builder ─────────────────────────────────────────
function osc({ type = 'sine', freq = 440, duration = 0.5, volume = 0.5, detune = 0,
                attack = 0.01, sustain, release = 0.2, destination = null } = {}) {
  if (!_enabled) return;
  try {
    const ctx  = getCtx();
    const g    = ctx.createGain();
    g.connect(destination || ctx.destination);
    envelope(g, { attack, sustain: sustain ?? (duration - attack - release), release, peak: volume });

    const o = ctx.createOscillator();
    o.type       = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.detune.setValueAtTime(detune, ctx.currentTime);
    o.connect(g);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently ignore — audio is non-critical
  }
}

// ── Noise generator ────────────────────────────────────────────
function noise({ duration = 0.2, volume = 0.3, bandpass = null } = {}) {
  if (!_enabled) return;
  try {
    const ctx        = getCtx();
    const bufSize    = ctx.sampleRate * duration;
    const buffer     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const g = ctx.createGain();
    envelope(g, { attack: 0.005, sustain: duration * 0.6, release: duration * 0.3, peak: volume });
    g.connect(ctx.destination);

    let last = source;
    if (bandpass) {
      const bp = ctx.createBiquadFilter();
      bp.type            = 'bandpass';
      bp.frequency.value = bandpass;
      bp.Q.value         = 2;
      source.connect(bp);
      bp.connect(g);
    } else {
      source.connect(g);
    }

    source.start();
    source.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// SOUND LIBRARY
// ═══════════════════════════════════════════════════════════════

export const sounds = {

  // ── Login success — ascending arpeggio ──────────────────────
  login() {
    if (!_enabled) return;
    const freqs = [261, 329, 392, 523]; // C4 E4 G4 C5
    freqs.forEach((freq, i) => {
      setTimeout(() => osc({ type: 'sine', freq, duration: 0.35, volume: 0.4, attack: 0.01, release: 0.25 }), i * 80);
    });
  },

  // ── Logout — descending sweep ────────────────────────────────
  logout() {
    if (!_enabled) return;
    const ctx = getCtx();
    try {
      const g = masterGain(0.35);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(600, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5);
      envelope(g, { attack: 0.01, sustain: 0.3, release: 0.2, peak: 0.35 });
      o.connect(g);
      o.start();
      o.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  },

  // ── Keystroke — soft click ───────────────────────────────────
  keystroke() {
    if (!_enabled) return;
    noise({ duration: 0.04, volume: 0.12, bandpass: 3000 });
  },

  // ── Button click — short blip ────────────────────────────────
  click() {
    if (!_enabled) return;
    osc({ type: 'square', freq: 880, duration: 0.06, volume: 0.2, attack: 0.002, release: 0.04 });
  },

  // ── Notification — soft ping ─────────────────────────────────
  notification() {
    if (!_enabled) return;
    osc({ type: 'sine', freq: 1047, duration: 0.4, volume: 0.3, attack: 0.01, release: 0.35 });
    setTimeout(() => osc({ type: 'sine', freq: 1319, duration: 0.3, volume: 0.2, attack: 0.01, release: 0.25 }), 120);
  },

  // ── Success — positive 3-tone chime ─────────────────────────
  success() {
    if (!_enabled) return;
    [[523, 0], [659, 100], [784, 200]].forEach(([freq, delay]) => {
      setTimeout(() => osc({ type: 'sine', freq, duration: 0.4, volume: 0.38, attack: 0.01, release: 0.3 }), delay);
    });
  },

  // ── Warning — two-tone alert ─────────────────────────────────
  warning() {
    if (!_enabled) return;
    const ctx = getCtx();
    try {
      const play = (freq, startDelay) => {
        setTimeout(() => {
          const g = masterGain(0.35);
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, ctx.currentTime);
          envelope(g, { attack: 0.01, sustain: 0.12, release: 0.08, peak: 0.35 });
          o.connect(g);
          o.start(ctx.currentTime);
          o.stop(ctx.currentTime + 0.22);
        }, startDelay);
      };
      play(440, 0);
      play(370, 250);
      play(440, 500);
    } catch (e) {}
  },

  // ── Critical alert — harsh alarm ─────────────────────────────
  critical() {
    if (!_enabled) return;
    const ctx = getCtx();
    try {
      const pulses = 3;
      for (let i = 0; i < pulses; i++) {
        setTimeout(() => {
          // High freq sawtooth
          const g1 = masterGain(0.4);
          const o1 = ctx.createOscillator();
          o1.type = 'sawtooth';
          o1.frequency.setValueAtTime(880, ctx.currentTime);
          o1.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.15);
          envelope(g1, { attack: 0.005, sustain: 0.1, release: 0.05, peak: 0.4 });
          o1.connect(g1); o1.start(); o1.stop(ctx.currentTime + 0.18);

          // Low freq drone underneath
          const g2 = masterGain(0.25);
          const o2 = ctx.createOscillator();
          o2.type = 'square';
          o2.frequency.setValueAtTime(110, ctx.currentTime);
          envelope(g2, { attack: 0.005, sustain: 0.1, release: 0.05, peak: 0.25 });
          o2.connect(g2); o2.start(); o2.stop(ctx.currentTime + 0.18);

          // Noise burst
          noise({ duration: 0.15, volume: 0.2 });
        }, i * 220);
      }
    } catch (e) {}
  },

  // ── Attack start — dark impact ────────────────────────────────
  attack() {
    if (!_enabled) return;
    const ctx = getCtx();
    try {
      // Descending frequency sweep — like a system compromise
      const g = masterGain(0.45);
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(400, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
      envelope(g, { attack: 0.005, sustain: 0.25, release: 0.15, peak: 0.45 });
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.45);

      // Noise layer
      setTimeout(() => noise({ duration: 0.3, volume: 0.25, bandpass: 800 }), 50);
    } catch (e) {}
  },

  // ── Privilege escalation — rising power tone ──────────────────
  escalate() {
    if (!_enabled) return;
    const ctx = getCtx();
    try {
      const g = masterGain(0.4);
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.setValueAtTime(150, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
      envelope(g, { attack: 0.01, sustain: 0.35, release: 0.15, peak: 0.4 });
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.55);

      // Harmonic layer
      setTimeout(() => osc({ type: 'sine', freq: 300, duration: 0.5, volume: 0.2 }), 100);
    } catch (e) {}
  },

  // ── Lateral movement — fast data blips ────────────────────────
  lateralMove() {
    if (!_enabled) return;
    const blipCount = 5;
    for (let i = 0; i < blipCount; i++) {
      setTimeout(() => {
        const freq = 400 + Math.random() * 400;
        osc({ type: 'sine', freq, duration: 0.08, volume: 0.3, attack: 0.005, release: 0.06 });
      }, i * 80);
    }
    // Final impact
    setTimeout(() => sounds.attack(), blipCount * 80);
  },

  // ── Exfiltration — data upload sound ─────────────────────────
  exfiltrate() {
    if (!_enabled) return;
    const ctx = getCtx();
    try {
      // Rapid ascending data-transfer blips
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          osc({ type: 'square', freq: 200 + i * 80, duration: 0.07, volume: 0.22, attack: 0.003, release: 0.05 });
        }, i * 60);
      }
      // Critical alarm at the end
      setTimeout(() => sounds.critical(), 520);
    } catch (e) {}
  },

  // ── Simulation reset — reboot / system restore ────────────────
  reset() {
    if (!_enabled) return;
    const ctx = getCtx();
    try {
      // Descending glide — "shutting down"
      const g = masterGain(0.4);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.6);
      envelope(g, { attack: 0.01, sustain: 0.4, release: 0.2, peak: 0.4 });
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.7);

      // Then a clean startup ping
      setTimeout(() => sounds.login(), 800);
    } catch (e) {}
  },

  // ── Device added — register beep ─────────────────────────────
  deviceAdded() {
    if (!_enabled) return;
    osc({ type: 'sine', freq: 660, duration: 0.15, volume: 0.3, attack: 0.005, release: 0.1 });
    setTimeout(() => osc({ type: 'sine', freq: 880, duration: 0.2, volume: 0.3, attack: 0.005, release: 0.15 }), 120);
  },

  // ── Device removed — delete beep ─────────────────────────────
  deviceRemoved() {
    if (!_enabled) return;
    osc({ type: 'sine', freq: 440, duration: 0.15, volume: 0.3, attack: 0.005, release: 0.1 });
    setTimeout(() => osc({ type: 'sine', freq: 330, duration: 0.2, volume: 0.3, attack: 0.005, release: 0.15 }), 100);
  },

  // ── Report generated — fanfare ────────────────────────────────
  reportGenerated() {
    if (!_enabled) return;
    [[523, 0], [659, 100], [784, 200], [1047, 350]].forEach(([freq, delay]) => {
      setTimeout(() => osc({ type: 'sine', freq, duration: 0.45, volume: 0.35, attack: 0.01, release: 0.35 }), delay);
    });
  },

  // ── Email sent — transmission sound ──────────────────────────
  emailSent() {
    if (!_enabled) return;
    // Ascending whoosh
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        osc({ type: 'sine', freq: 300 + i * 120, duration: 0.1, volume: 0.25, attack: 0.005, release: 0.08 });
      }, i * 50);
    }
    setTimeout(() => sounds.success(), 350);
  },

  // ── Log entry — by severity ──────────────────────────────────
  logEntry(type = 'INFO') {
    if (!_enabled) return;
    if (type === 'CRITICAL') { sounds.critical(); return; }
    if (type === 'WARNING')  { sounds.warning();  return; }
    if (type === 'SUCCESS')  {
      osc({ type: 'sine', freq: 880, duration: 0.15, volume: 0.2, attack: 0.005, release: 0.1 });
      return;
    }
    // INFO — very subtle tick
    osc({ type: 'sine', freq: 1200, duration: 0.06, volume: 0.1, attack: 0.002, release: 0.05 });
  },

  // ── Ambient background — cyberpunk hum ───────────────────────
  ambient: (() => {
    let _running = false;
    let _nodes   = [];

    const start = () => {
      if (!_enabled || _running) return;
      _running = true;

      try {
        const ctx = getCtx();

        // Sub-bass drone
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(55, ctx.currentTime);

        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(_masterVolume * 0.08, ctx.currentTime);

        drone.connect(droneGain);
        droneGain.connect(ctx.destination);
        drone.start();
        _nodes.push(drone, droneGain);

        // Mid-range hum with slow LFO modulation
        const hum = ctx.createOscillator();
        hum.type = 'triangle';
        hum.frequency.setValueAtTime(110, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // Very slow

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(3, ctx.currentTime); // LFO depth in Hz

        lfo.connect(lfoGain);
        lfoGain.connect(hum.frequency);

        const humGain = ctx.createGain();
        humGain.gain.setValueAtTime(_masterVolume * 0.05, ctx.currentTime);
        hum.connect(humGain);
        humGain.connect(ctx.destination);

        hum.start();
        lfo.start();
        _nodes.push(hum, humGain, lfo, lfoGain);

        // Occasional random high-frequency blips
        const blipInterval = setInterval(() => {
          if (!_running || !_enabled) { clearInterval(blipInterval); return; }
          if (Math.random() > 0.4) { // 60% chance each interval
            const freq = 800 + Math.random() * 1200;
            osc({ type: 'sine', freq, duration: 0.04, volume: 0.06, attack: 0.002, release: 0.03 });
          }
        }, 2500);
        _nodes.push({ stop: () => clearInterval(blipInterval) });

      } catch (e) {}
    };

    const stop = () => {
      _running = false;
      _nodes.forEach(n => {
        try {
          if (typeof n.stop === 'function') n.stop();
          if (typeof n.disconnect === 'function') n.disconnect();
        } catch (e) {}
      });
      _nodes = [];
    };

    const toggle = () => {
      if (_running) stop(); else start();
      return _running;
    };

    return { start, stop, toggle, isRunning: () => _running };
  })(),
};

// ── Map attack stage IDs to sounds ────────────────────────────
export const attackSound = {
  start:      () => sounds.attack(),
  escalate:   () => sounds.escalate(),
  move:       () => sounds.lateralMove(),
  exfiltrate: () => sounds.exfiltrate(),
};
