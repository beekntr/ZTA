import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLiveFeed } from '../../hooks/useLogs';
import { SkeletonRows } from '../ui/Skeleton';
import { formatTime } from '../../lib/format';

export const LiveAttackFeed: React.FC = () => {
  const { data, isLoading } = useLiveFeed();
  const logs = Array.isArray(data) ? data : [];

  if (isLoading) return <SkeletonRows rows={8} />;
  if (logs.length === 0) return <p className="py-8 text-center text-sm text-muted">No attacks right now</p>;

  return (
    <ul className="-my-1 max-h-[520px] overflow-y-auto pr-1">
      {logs.map((log) => (
        <li key={log.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
          <span className="w-16 shrink-0 text-xs tabular-nums text-muted">{formatTime(log.timestamp, 'HH:mm:ss')}</span>
          <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs">
            <span className="truncate text-fg">{log.src_ip}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-muted" />
            <span className="truncate text-fg-2">
              {log.dst_ip}
              {log.dst_port ? `:${log.dst_port}` : ''}
            </span>
          </span>
          <span className="ml-auto shrink-0 text-xs uppercase text-muted">{log.protocol}</span>
        </li>
      ))}
    </ul>
  );
};
