import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { SkeletonRows } from '../ui/Skeleton';
import { useLogs } from '../../hooks/useLogs';
import { formatTime } from '../../lib/format';

export const RecentLogsWidget: React.FC = () => {
  const { data, isLoading } = useLogs({ limit: 8 });
  const logs = Array.isArray(data) ? data : [];

  if (isLoading) return <SkeletonRows rows={6} />;
  if (logs.length === 0) return <p className="py-8 text-center text-sm text-muted">No recent events</p>;

  return (
    <ul className="-my-1">
      {logs.map((log) => (
        <li key={log.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
          <span className="w-16 shrink-0 text-xs tabular-nums text-muted">{formatTime(log.timestamp, 'HH:mm:ss')}</span>
          <Badge type={log.log_type} className="shrink-0" />
          <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-fg-2">
            <span className="truncate">{log.src_ip}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-muted" />
            <span className="truncate">{log.dst_ip}</span>
          </span>
          <span className="ml-auto shrink-0 text-xs uppercase text-muted">{log.protocol}</span>
        </li>
      ))}
    </ul>
  );
};
