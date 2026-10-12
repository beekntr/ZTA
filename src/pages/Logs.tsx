import React, { useState } from 'react';
import { useLogs } from '../hooks/useLogs';
import { LogFilters } from '../components/logs/LogFilters';
import { LogTable } from '../components/logs/LogTable';
import { Card } from '../components/ui/Card';
import { validateIp } from '../services/api';

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

  // Only query once a complete IP is typed, not on every keystroke.
  const ipFilter = validateIp(filters.srcIp) ? filters.srcIp.trim() : '';

  const queryFilters = {
    limit: 200,
    ...(filters.logType && { log_type: filters.logType }),
    ...(ipFilter && { src_ip: ipFilter }),
  };

  const { data: logs = [], isLoading } = useLogs(queryFilters, filters.autoRefresh ? 5_000 : false);

  // Client-side protocol filter
  const filtered = filters.protocol
    ? logs.filter((l) => l.protocol?.toLowerCase() === filters.protocol.toLowerCase())
    : logs;

  return (
    <div className="space-y-4 animate-fade-in">
      <Card padding="p-4">
        <LogFilters filters={filters} onChange={setFilters} />
        {filters.srcIp && !ipFilter && (
          <p className="mt-2 text-xs text-warning">Type a complete IP address to filter</p>
        )}
      </Card>

      <Card>
        <LogTable
          key={`${filters.logType}|${ipFilter}|${filters.protocol}`}
          logs={filtered}
          onIpClick={(ip: string) => setFilters((f) => ({ ...f, srcIp: ip }))}
          loading={isLoading}
        />
      </Card>
    </div>
  );
};
