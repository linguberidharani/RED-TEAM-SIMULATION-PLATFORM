/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      colors: {
        bg: '#080c10',
        surface: '#0d1117',
        panel: '#111820',
        border: '#1e2d3d',
        accent: '#00ff88',
        accentDim: '#00cc6a',
        red: '#ff3b3b',
        redDim: '#cc2f2f',
        yellow: '#ffd60a',
        blue: '#0ea5e9',
        purple: '#a855f7',
        muted: '#4a6270',
        text: '#c9d1d9',
        textDim: '#6e7e8a',
      },
      animation: {
        pulse2: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        flicker: 'flicker 3s infinite',
        scanline: 'scanline 4s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        flicker: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
          '75%': { opacity: 0.95 },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          from: { textShadow: '0 0 4px #00ff88, 0 0 10px #00ff88' },
          to: { textShadow: '0 0 8px #00ff88, 0 0 20px #00ff8880' },
        },
      },
      boxShadow: {
        accent: '0 0 0 1px #00ff8840, 0 0 20px #00ff8820',
        red: '0 0 0 1px #ff3b3b40, 0 0 20px #ff3b3b20',
        panel: '0 4px 24px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
