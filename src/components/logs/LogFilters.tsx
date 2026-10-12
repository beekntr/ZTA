import React from 'react';
import { Search, Filter, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/Button';

const LOG_TYPES = [
  'ZTA-INPUT-DROP',
  'ZTA-FORWARD-DROP',
  'ZTA-BLOCKED-U2T',
  'ZTA-BLOCKED-T2U',
  'ZTA-SSH-ALLOW',
  'ZTA-ALLOW-D2T',
  'ZTA-ALLOW-D2U',
  'ZTA-SSH-PUBLIC',
  'ZTA-API-BLOCK',
];

interface LogFiltersState {
  srcIp: string;
  logType: string;
  protocol: string;
  autoRefresh: boolean;
}

interface LogFiltersProps {
  filters: LogFiltersState;
  onChange: (f: LogFiltersState) => void;
}

export const LogFilters: React.FC<LogFiltersProps> = ({ filters, onChange }) => {
  const set = (patch: Partial<LogFiltersState>) => onChange({ ...filters, ...patch });
  const reset = () => onChange({ srcIp: '', logType: '', protocol: '', autoRefresh: false });

  const hasFilters = filters.srcIp || filters.logType || filters.protocol;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* IP search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by IP..."
          value={filters.srcIp}
          onChange={(e) => set({ srcIp: e.target.value })}
          className="pl-9 pr-3 py-2 rounded-lg bg-[#1e2a45]/40 border border-[#1e2a45] text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 w-44"
        />
      </div>

      {/* Log type */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <select
          value={filters.logType}
          onChange={(e) => set({ logType: e.target.value })}
          className="pl-9 pr-3 py-2 rounded-lg bg-[#1e2a45]/40 border border-[#1e2a45] text-slate-300 text-sm focus:outline-none focus:border-cyan-500/40 appearance-none"
        >
          <option value="">All types</option>
          {LOG_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Protocol */}
      <select
        value={filters.protocol}
        onChange={(e) => set({ protocol: e.target.value })}
        className="px-3 py-2 rounded-lg bg-[#1e2a45]/40 border border-[#1e2a45] text-slate-300 text-sm focus:outline-none focus:border-cyan-500/40"
      >
        <option value="">All protocols</option>
        <option value="tcp">TCP</option>
        <option value="udp">UDP</option>
        <option value="icmp">ICMP</option>
      </select>

      {/* Auto-refresh */}
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => set({ autoRefresh: !filters.autoRefresh })}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            filters.autoRefresh ? 'bg-cyan-500/60' : 'bg-[#1e2a45]'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              filters.autoRefresh ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Auto-refresh
        </span>
      </label>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" icon={<X className="w-3 h-3" />} onClick={reset}>
          Clear
        </Button>
      )}
    </div>
  );
};
