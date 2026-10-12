import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScrollText,
  Crosshair,
  ShieldCheck,
  Server,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const NAV_GROUPS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Monitor',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/logs', label: 'Live logs', icon: ScrollText },
      { to: '/threats', label: 'Threat intel', icon: Crosshair },
    ],
  },
  {
    title: 'Control',
    items: [
      { to: '/rules', label: 'Firewall rules', icon: ShieldCheck },
      { to: '/devices', label: 'Devices', icon: Server },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      {/* Brand */}
      <div className={`flex h-16 items-center gap-3 border-b border-line px-4 ${collapsed ? 'justify-center px-0' : ''}`}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-on-accent">
          <Shield className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-fg">ZTA Firewall</p>
            <p className="text-xs leading-tight text-muted">Zero Trust Architecture</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Main">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">{group.title}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  title={collapsed ? label : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `flex h-9 items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                      collapsed ? 'justify-center' : 'px-3'
                    } ${
                      isActive
                        ? 'bg-accent-soft text-accent-text'
                        : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-line p-3">
        <button
          onClick={onToggle}
          className={`flex h-9 w-full items-center gap-3 rounded-lg text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg ${
            collapsed ? 'justify-center' : 'px-3'
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.75} />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
