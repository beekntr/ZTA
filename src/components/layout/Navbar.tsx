import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { getHealth } from '../../services/api';
import type { HealthState } from '../../services/api';
import { AdminButton } from './AdminButton';
import { ThemeToggle } from './ThemeToggle';

const PAGES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Firewall activity over the last 7 days' },
  '/logs': { title: 'Live logs', subtitle: 'Every packet the firewall logged' },
  '/threats': { title: 'Threat intel', subtitle: 'Who is attacking from the internet' },
  '/rules': { title: 'Firewall rules', subtitle: 'Policies enforced by nftables' },
  '/devices': { title: 'Devices', subtitle: 'Registered hosts and their trust scores' },
};

const HEALTH: Record<HealthState | 'checking', { dot: string; label: string; hint?: string }> = {
  checking: { dot: 'bg-line-strong', label: 'Checking' },
  ok: { dot: 'bg-good-mark', label: 'Online' },
  degraded: { dot: 'bg-warning-mark', label: 'Degraded', hint: 'API reachable, but the database or firewall check failed' },
  down: { dot: 'bg-critical-mark', label: 'Offline', hint: 'The API is not responding' },
};

export const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const [health, setHealth] = useState<HealthState | null>(null);
  const [time, setTime] = useState(new Date());

  // API health (database + firewall) polling every 30s
  useEffect(() => {
    const check = async () => {
      setHealth(await getHealth());
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const page = PAGES[pathname] ?? { title: 'ZTA Firewall', subtitle: '' };
  const status = HEALTH[health ?? 'checking'];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-fg">{page.title}</h1>
        <p className="hidden truncate text-xs text-muted sm:block">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-xs tabular-nums text-muted lg:inline">
          {format(time, 'EEE d MMM · HH:mm:ss')}
        </span>
        <span
          className="flex h-8 items-center gap-2 rounded-full border border-line px-3 text-xs font-medium text-fg-2"
          title={status.hint}
        >
          <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
          <span className="hidden sm:inline">{status.label}</span>
          <span className="sr-only sm:hidden">{status.label}</span>
        </span>
        <ThemeToggle />
        <AdminButton />
      </div>
    </header>
  );
};
