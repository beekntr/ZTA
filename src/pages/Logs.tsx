import React, { useState, useCallback } from 'react';
import { Circle } from 'lucide-react';
import { useLogs } from '../hooks/useLogs';
import { LogFilters } from '../components/logs/LogFilters';
import { LogTable } from '../components/logs/LogTable';
import { Card } from '../components/ui/Card';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useQueryClient } from '@tanstack/react-query';

interface FilterState {
  srcIp: string;
  logType: string;
  protocol: string;
  autoRefresh: boolean;
}

const INIT_FILTERS: FilterState = {
  srcIp: '',
  logType: '',
  protocol: '',
  autoRefresh: false,
};

export const Logs: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(INIT_FILTERS);
  const qc = useQueryClient();

  const queryFilters = {
    limit: 200,
    ...(filters.logType && { log_type: filters.logType }),
    ...(filters.srcIp && { src_ip: filters.srcIp }),
  };

  const { data: logs = [], isLoading } = useLogs(queryFilters);

  // Client-side protocol filter
  const filtered = filters.protocol
    ? logs.filter((l) => l.protocol?.toLowerCase() === filters.protocol.toLowerCase())
    : logs;

  // Auto-refresh
  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: ['logs'] }), [qc]);
  useAutoRefresh(refresh, 5_000, filters.autoRefresh);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Circle
              className={`w-2 h-2 fill-current ${filters.autoRefresh ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`}
            />
            <span className="text-xs text-slate-500">
              {filters.autoRefresh ? 'Auto-refresh ON (5s)' : 'Auto-refresh OFF'}
            </span>
          </div>
        </div>
        <LogFilters filters={filters} onChange={setFilters} />
      </Card>

      <Card>
        <LogTable
          logs={filtered}
          onIpClick={(ip) => setFilters((f) => ({ ...f, srcIp: ip }))}
          loading={isLoading}
        />
      </Card>
    </div>
  );
};
