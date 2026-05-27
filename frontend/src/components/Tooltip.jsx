import { useState, useRef, useEffect } from 'react';

/**
 * Tooltip — shows an info icon (ℹ) that reveals a description on hover or click.
 *
 * Usage:
 *   <Tooltip text="Devices represent computers and servers in the simulation." />
 *   <Tooltip text="..." position="right" />
 */
export default function Tooltip({ text, position = 'right', className = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setVisible(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const positionClasses = {
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };

  return (
    <span ref={ref} className={`relative inline-flex items-center ${className}`}>
      {/* Info icon button */}
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="w-4 h-4 rounded-full bg-border text-textDim hover:bg-accent/20 hover:text-accent
                   flex items-center justify-center text-[10px] font-bold transition-all
                   focus:outline-none focus:ring-1 focus:ring-accent/50 flex-shrink-0"
        aria-label="More information"
      >
        i
      </button>

      {/* Tooltip bubble */}
      {visible && (
        <div
          className={`absolute z-50 w-56 p-3 rounded-lg text-xs font-body leading-relaxed
                      bg-panel border border-accent/30 text-text shadow-panel
                      ${positionClasses[position] || positionClasses.right}`}
          style={{ boxShadow: '0 4px 20px rgba(0,255,136,0.1)' }}
        >
          {/* Small arrow */}
          <div
            className={`absolute w-2 h-2 bg-panel border-accent/30 rotate-45
              ${position === 'right'  ? 'right-full top-1/2 -translate-y-1/2 mr-[-5px] border-l border-b' : ''}
              ${position === 'left'   ? 'left-full top-1/2 -translate-y-1/2 ml-[-5px] border-r border-t' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 mb-[-5px] border-l border-t' : ''}
              ${position === 'top'    ? 'top-full left-1/2 -translate-x-1/2 mt-[-5px] border-r border-b'  : ''}
            `}
          />
          <span className="text-accent font-mono text-[9px] uppercase tracking-widest block mb-1">
            ℹ Info
          </span>
          {text}
        </div>
      )}
    </span>
  );
}
