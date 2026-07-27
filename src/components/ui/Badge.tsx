import React from 'react';
import type { LogType } from '../../types';

const LOG_TYPE_STYLES: Record<string, string> = {
  'ZTA-INPUT-DROP': 'bg-red-900/40 text-red-400 border border-red-500/30',
  'ZTA-FORWARD-DROP': 'bg-orange-900/40 text-orange-400 border border-orange-500/30',
  'ZTA-BLOCKED-U2T': 'bg-red-950/60 text-red-300 border border-red-600/30',
  'ZTA-BLOCKED-T2U': 'bg-rose-900/40 text-rose-400 border border-rose-500/30',
  'ZTA-SSH-ALLOW': 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30',
  'ZTA-ALLOW-D2T': 'bg-blue-900/40 text-blue-400 border border-blue-500/30',
  'ZTA-ALLOW-D2U': 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30',
};

const DEFAULT_STYLE = 'bg-slate-800/40 text-slate-400 border border-slate-500/30';

interface BadgeProps {
  type: LogType | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, className = '' }) => {
  const style = LOG_TYPE_STYLES[type] ?? DEFAULT_STYLE;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${style} ${className}`}
    >
      {type}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: 'trusted' | 'suspicious' | 'blocked' }> = ({
  status,
}) => {
  const map = {
    trusted: 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30',
    suspicious: 'bg-amber-900/40 text-amber-400 border border-amber-500/30',
    blocked: 'bg-red-900/40 text-red-400 border border-red-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const ZoneBadge: React.FC<{ zone: string | null | undefined }> = ({ zone }) => {
  const map: Record<string, string> = {
    trusted: 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30',
    untrust: 'bg-red-900/40 text-red-400 border border-red-500/30',
    dmz: 'bg-blue-900/40 text-blue-400 border border-blue-500/30',
  };
  const normalized = zone?.toLowerCase() ?? 'unknown';
  const style = map[normalized] ?? DEFAULT_STYLE;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {zone?.toUpperCase() ?? 'UNKNOWN'}
    </span>
  );
};
