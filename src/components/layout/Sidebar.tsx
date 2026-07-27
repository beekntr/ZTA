import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Cpu,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/logs', label: 'Live Logs', icon: <ScrollText className="w-5 h-5" /> },
  { to: '/rules', label: 'Firewall Rules', icon: <ShieldCheck className="w-5 h-5" /> },
  { to: '/devices', label: 'Devices', icon: <Cpu className="w-5 h-5" /> },
  { to: '/threats', label: 'Threat Intel', icon: <Crosshair className="w-5 h-5" /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`
        relative flex flex-col border-r border-border bg-bg
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? 'justify-center' : ''}`}
      >
        <div className="relative shrink-0">
          <Shield className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
          <div className="absolute inset-0 animate-ping-slow opacity-30">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-none">ZTA Firewall</h1>
            <p className="text-[10px] text-cyan-500 mt-0.5 font-mono tracking-widest">
              ZERO TRUST
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg
              text-sm font-medium transition-all duration-200 group
              ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-border/50'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <span className="shrink-0">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center m-3 p-2 rounded-lg border border-border text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
      </button>
    </aside>
  );
};
