import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { sounds } from '../utils/soundEngine';
import SoundControl from './SoundControl';
import GuidedTour   from './GuidedTour';

const NAV = [
  { to: '/welcome',    icon: '⬡', label: 'Welcome'    },
  { to: '/dashboard',  icon: '◈', label: 'Dashboard'  },
  { to: '/devices',    icon: '⬟', label: 'Devices'    },
  { to: '/simulation', icon: '◉', label: 'Simulation' },
  { to: '/logs',       icon: '≡', label: 'Logs'       },
  { to: '/reports',    icon: '◫', label: 'Reports'    },
  { to: '/help',       icon: '?', label: 'Help'       },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showTour,  setShowTour]  = useState(false);

  const handleLogout = () => {
    sounds.logout();
    setTimeout(() => { logout(); navigate('/login'); }, 400);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Guided tour — shows automatically on first login */}
      <GuidedTour forceShow={showTour} onClose={() => setShowTour(false)} />

      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}
        style={{ background: '#090e14' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <div className="w-8 h-8 rounded border border-accent flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-display text-xs font-bold">RT</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-display text-accent text-xs font-bold tracking-widest glow-text">REDTEAM</div>
              <div className="text-textDim text-[9px] font-mono tracking-wider">SIM PLATFORM</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => sounds.click()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-textDim hover:text-text hover:bg-white/5 border border-transparent'
                } ${to === '/help' ? 'mt-2 border-t border-border pt-3' : ''}`
              }
            >
              <span className="text-base flex-shrink-0">{icon}</span>
              {!collapsed && <span className="font-medium tracking-wide">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + collapse */}
        <div className="border-t border-border p-3 space-y-2">
          {!collapsed && (
            <div className="px-2 py-1">
              <div className="text-text text-xs font-medium">{user?.name || user?.email}</div>
              <div className="text-textDim text-[10px] font-mono uppercase tracking-wider">{user?.role}</div>
            </div>
          )}
          {/* Restart tour button */}
          {!collapsed && (
            <button
              onClick={() => setShowTour(true)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs text-textDim
                         border border-border hover:text-accent hover:border-accent/30 transition-all font-mono"
            >
              <span>▶</span> Restart Tour
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-red/80
                       hover:text-red hover:bg-red/10 border border-transparent hover:border-red/20
                       transition-all font-body"
          >
            <span>⏻</span>
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => { sounds.click(); setCollapsed(c => !c); }}
            className="w-full flex items-center justify-center py-1 text-textDim hover:text-text text-xs transition-colors"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs text-textDim">SYSTEM ONLINE</span>
          </div>
          <div className="font-mono text-xs text-textDim">
            {new Date().toLocaleString()} UTC
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>

      <SoundControl />
    </div>
  );
}