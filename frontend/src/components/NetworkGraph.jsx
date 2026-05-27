// NetworkGraph — SVG-based attack flow visualizer

const TYPE_ICONS = { Server: '🖥', PC: '💻', Database: '🗄', Router: '📡', Firewall: '🛡' };

function getNodePosition(index, total, cx, cy, rx, ry) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

export default function NetworkGraph({ devices }) {
  const W = 580, H = 320;
  const cx = W / 2, cy = H / 2;
  const rx = 180, ry = 110;

  const positions = devices.map((_, i) => getNodePosition(i, devices.length, cx, cy, rx, ry));

  // Draw connection lines between compromised devices
  const connections = [];
  devices.forEach((src, si) => {
    if (!src.compromised) return;
    devices.forEach((tgt, ti) => {
      if (si >= ti || !tgt.compromised) return;
      connections.push({ from: positions[si], to: positions[ti], key: `${si}-${ti}` });
    });
  });

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 320 }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e2d3d" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="safeGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#00ff8840" />
            <stop offset="100%" stopColor="#00ff8800" />
          </radialGradient>
          <radialGradient id="compGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ff3b3b40" />
            <stop offset="100%" stopColor="#ff3b3b00" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#grid)" />

        {/* C2 center hub */}
        <circle cx={cx} cy={cy} r={28} fill="#0d1117" stroke="#00ff88" strokeWidth="1.5" filter="url(#glow)" />
        <circle cx={cx} cy={cy} r={24} fill="#0d1117" stroke="#00ff8840" strokeWidth="1" strokeDasharray="4 3" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#00ff88" fontSize="10" fontFamily="Orbitron" fontWeight="bold">C2</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#4a6270" fontSize="7" fontFamily="Share Tech Mono">COMMAND</text>

        {/* Spoke lines from C2 to each device */}
        {positions.map((pos, i) => {
          const dev = devices[i];
          const color = dev.compromised ? '#ff3b3b' : '#1e2d3d';
          const dashArray = dev.compromised ? '4 2' : '6 4';
          return (
            <line
              key={`spoke-${i}`}
              x1={cx} y1={cy} x2={pos.x} y2={pos.y}
              stroke={color} strokeWidth="1" strokeDasharray={dashArray} opacity="0.6"
            />
          );
        })}

        {/* Lateral movement connections */}
        {connections.map(c => (
          <line
            key={c.key}
            x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y}
            stroke="#ff3b3b" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7"
          />
        ))}

        {/* Device nodes */}
        {devices.map((dev, i) => {
          const pos = positions[i];
          const color = dev.compromised ? '#ff3b3b' : '#00ff88';
          const bg = dev.compromised ? '#1a0a0a' : '#0a1a10';
          const label = dev.name.length > 12 ? dev.name.slice(0, 11) + '…' : dev.name;
          return (
            <g key={dev.id}>
              {/* Glow aura */}
              {dev.compromised && (
                <circle cx={pos.x} cy={pos.y} r={22} fill="url(#compGrad)">
                  <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Node circle */}
              <circle
                cx={pos.x} cy={pos.y} r={18}
                fill={bg} stroke={color} strokeWidth="1.5"
                filter={dev.compromised ? 'url(#glow)' : undefined}
              />
              {/* Icon */}
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11">
                {TYPE_ICONS[dev.type] || '💡'}
              </text>
              {/* Device label */}
              <text x={pos.x} y={pos.y + 26} textAnchor="middle" fill={color} fontSize="7"
                fontFamily="Share Tech Mono">
                {label}
              </text>
              {/* Stage badges */}
              {dev.attackStages.slice(0, 2).map((s, si) => (
                <rect
                  key={s}
                  x={pos.x + 10 + si * 14} y={pos.y - 26}
                  width={12} height={8} rx={2}
                  fill={s === 'exfiltrate' ? '#ff3b3b' : s === 'move' ? '#ffd60a' : s === 'escalate' ? '#a855f7' : '#0ea5e9'}
                  opacity="0.9"
                />
              ))}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(10, 280)">
          <circle cx={8} cy={8} r={6} fill="#0a1a10" stroke="#00ff88" strokeWidth="1" />
          <text x={18} y={12} fill="#4a6270" fontSize="8" fontFamily="Share Tech Mono">Safe</text>
          <circle cx={58} cy={8} r={6} fill="#1a0a0a" stroke="#ff3b3b" strokeWidth="1" />
          <text x={68} y={12} fill="#4a6270" fontSize="8" fontFamily="Share Tech Mono">Compromised</text>
          <line x1={120} y1={4} x2={140} y2={12} stroke="#ff3b3b" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x={144} y={12} fill="#4a6270" fontSize="8" fontFamily="Share Tech Mono">Lateral move</text>
        </g>
      </svg>
    </div>
  );
}
