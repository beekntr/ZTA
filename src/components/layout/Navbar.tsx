import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Wifi, WifiOff, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { getHealth } from '../../services/api';
import type { HealthState } from '../../services/api';
import { AdminButton } from './AdminButton';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/logs': 'Live Logs',
  '/rules': 'Firewall Rules',
  '/devices': 'Device Registry',
  '/threats': 'Threat Intelligence',
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

  const title = PAGE_TITLES[pathname] ?? 'ZTA Dashboard';

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#1e2a45] bg-[#0a0e1a]/90 backdrop-blur-md shrink-0">
      <div>
        <h2 className="text-base font-semibold text-slate-200">{title}</h2>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Zero Trust Architecture · Admin Panel
        </p>
      </div>

      <div className="flex items-center gap-5">
        {/* Clock */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>{format(time, 'HH:mm:ss')}</span>
          <span className="text-slate-600">·</span>
          <span>{format(time, 'dd MMM yyyy')}</span>
        </div>

        {/* Connection status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
            health === null
              ? 'border-slate-600/40 text-slate-500 bg-slate-800/30'
              : health === 'ok'
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                : health === 'degraded'
                  ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                  : 'border-red-500/30 text-red-400 bg-red-500/10'
          }`}
          title={health === 'degraded' ? 'API reachable, but the database or firewall check failed' : undefined}
        >
          {health === null ? (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              Checking…
            </>
          ) : health === 'ok' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3 h-3" />
              Connected
            </>
          ) : health === 'degraded' ? (
            <>
              <AlertTriangle className="w-3 h-3" />
              Degraded
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <WifiOff className="w-3 h-3" />
              Disconnected
            </>
          )}
        </div>

        <AdminButton />
      </div>
    </header>
  );
};
