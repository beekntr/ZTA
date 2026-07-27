import React from 'react';
import { format, parseISO } from 'date-fns';
import { Zap, Circle } from 'lucide-react';
import { useLiveFeed } from '../../hooks/useLogs';

export const LiveAttackFeed: React.FC = () => {
  const { data, dataUpdatedAt } = useLiveFeed();
  // Defensive: always treat as array regardless of API response shape
  const logs = Array.isArray(data) ? data : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Circle className="w-2 h-2 text-red-400 fill-red-400 animate-pulse" />
        <span className="text-xs text-red-400 font-medium">LIVE</span>
        <span className="text-xs text-slate-600">— polling every 5s</span>
        {dataUpdatedAt > 0 && (
          <span className="ml-auto text-xs text-slate-600">
            {format(new Date(dataUpdatedAt), 'HH:mm:ss')}
          </span>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-center text-slate-600 text-sm py-8">No active attacks detected</p>
        ) : (
          logs.map((log, i) => (
            <div
              key={log.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                i === 0
                  ? 'bg-red-900/15 border-red-500/20'
                  : 'bg-border/10 border-border/30'
              }`}
            >
              <Zap className={`w-3 h-3 shrink-0 ${i === 0 ? 'text-red-400' : 'text-slate-600'}`} />
              <span className="font-mono text-xs text-red-300 shrink-0">{log.src_ip}</span>
              <span className="text-slate-700 text-xs">→</span>
              <span className="font-mono text-xs text-slate-500 truncate">{log.dst_ip}</span>
              <span className="text-xs text-slate-600 ml-auto shrink-0 uppercase">
                {log.protocol}
                {log.dst_port ? `:${log.dst_port}` : ''}
              </span>
              <span className="text-[10px] text-slate-700 shrink-0">
                {(() => {
                  try {
                    return format(parseISO(log.timestamp), 'HH:mm:ss');
                  } catch {
                    return '';
                  }
                })()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
