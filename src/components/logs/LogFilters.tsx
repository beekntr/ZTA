import React from 'react';
import { Search, X } from 'lucide-react';
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
  const reset = () => onChange({ srcIp: '', logType: '', protocol: '', autoRefresh: filters.autoRefresh });

  const hasFilters = filters.srcIp || filters.logType || filters.protocol;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-56">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Filter by source IP"
          aria-label="Filter by source IP"
          value={filters.srcIp}
          onChange={(e) => set({ srcIp: e.target.value })}
          className="field pl-9 font-mono"
        />
      </div>

      <select
        value={filters.logType}
        onChange={(e) => set({ logType: e.target.value })}
        aria-label="Log type"
        className="field w-auto min-w-44"
      >
        <option value="">All log types</option>
        {LOG_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.replace(/^ZTA-/, '')}
          </option>
        ))}
      </select>

      <select
        value={filters.protocol}
        onChange={(e) => set({ protocol: e.target.value })}
        aria-label="Protocol"
        className="field w-auto min-w-36"
      >
        <option value="">All protocols</option>
        <option value="tcp">TCP</option>
        <option value="udp">UDP</option>
        <option value="icmp">ICMP</option>
      </select>

      {hasFilters && (
        <Button variant="ghost" size="sm" icon={<X className="h-3.5 w-3.5" />} onClick={reset}>
          Clear
        </Button>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={filters.autoRefresh}
        onClick={() => set({ autoRefresh: !filters.autoRefresh })}
        className="ml-auto flex items-center gap-2.5 text-sm text-fg-2"
      >
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${
            filters.autoRefresh ? 'bg-accent' : 'bg-line-strong'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              filters.autoRefresh ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`}
          />
        </span>
        Auto-refresh
      </button>
    </div>
  );
};
