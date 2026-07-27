import React from 'react';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/Badge';
import { useLogs } from '../../hooks/useLogs';
import { Circle } from 'lucide-react';

export const RecentLogsWidget: React.FC = () => {
  const { data, isLoading, dataUpdatedAt } = useLogs({ limit: 10 });

  // Defensive: ensure data is always an array
  const logs = Array.isArray(data) ? data : [];

  return (
    <div>
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-3">
        <Circle className="w-2 h-2 text-emerald-400 fill-emerald-400 animate-pulse" />
        <span className="text-xs text-slate-500">
          Live · auto-refresh every 10s
          {dataUpdatedAt > 0 && (
            <span className="ml-2 text-slate-600">
              · updated {format(new Date(dataUpdatedAt), 'HH:mm:ss')}
            </span>
          )}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-border/60 rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-2 py-2 px-3 rounded-lg bg-border/20 hover:bg-border/40 transition-colors"
            >
              <Badge type={log.log_type} className="shrink-0" />
              <span className="font-mono text-xs text-slate-400 shrink-0">{log.src_ip}</span>
              <span className="text-slate-700 text-xs">→</span>
              <span className="font-mono text-xs text-slate-500 truncate">{log.dst_ip}</span>
              <span className="ml-auto text-[10px] text-slate-600 shrink-0">
                {(() => {
                  try {
                    return format(parseISO(log.timestamp), 'HH:mm:ss');
                  } catch {
                    return '';
                  }
                })()}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-slate-600 text-sm py-6">No recent logs</p>
          )}
        </div>
      )}
    </div>
  );
};
