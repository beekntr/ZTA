import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight, Download, ChevronLeft } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Log } from '../../types';

interface Props {
  logs: Log[];
  onIpClick?: (ip: string) => void;
  loading?: boolean;
}

const PAGE_SIZE = 50;

function exportCsv(logs: Log[]) {
  const headers = ['ID', 'Timestamp', 'Type', 'Src IP', 'Dst IP', 'Protocol', 'Src Port', 'Dst Port', 'In Iface'];
  const rows = logs.map((l) => [
    l.id,
    l.timestamp,
    l.log_type,
    l.src_ip,
    l.dst_ip,
    l.protocol,
    l.src_port ?? '',
    l.dst_port ?? '',
    l.in_iface,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zta-logs-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const LogTable: React.FC<Props> = ({ logs, onIpClick, loading }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const safeLogs = Array.isArray(logs) ? logs : [];
  const totalPages = Math.ceil(safeLogs.length / PAGE_SIZE);
  const pageLogs = safeLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-border/60 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500">
          {safeLogs.length.toLocaleString()} logs
          {totalPages > 1 && ` · page ${page + 1} of ${totalPages}`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          icon={<Download className="w-3 h-3" />}
          onClick={() => exportCsv(safeLogs)}
        >
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-border/40">
            <tr>
              {['ID', 'Timestamp', 'Type', 'Src IP', 'Dst IP', 'Proto', 'Port', 'Iface', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {pageLogs.map((log) => (
              <React.Fragment key={log.id}>
                <tr
                  className="hover:bg-border/20 transition-colors cursor-pointer group"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <td className="px-3 py-2.5 font-mono text-slate-600">{log.id}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-400 whitespace-nowrap">
                    {(() => {
                      try {
                        return format(parseISO(log.timestamp), 'MM-dd HH:mm:ss');
                      } catch {
                        return log.timestamp;
                      }
                    })()}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge type={log.log_type} />
                  </td>
                  <td
                    className="px-3 py-2.5 font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIpClick?.(log.src_ip);
                    }}
                  >
                    {log.src_ip}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-400">{log.dst_ip}</td>
                  <td className="px-3 py-2.5 text-slate-500 uppercase">{log.protocol}</td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {log.dst_port ?? log.src_port ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{log.in_iface}</td>
                  <td className="px-3 py-2.5">
                    {expanded === log.id ? (
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                    )}
                  </td>
                </tr>
                {expanded === log.id && (
                  <tr className="bg-bg/60">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="rounded-lg bg-border/30 p-3 border border-border">
                        <p className="text-xs text-slate-500 mb-1 font-medium">Raw Log</p>
                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                          {log.raw_log}
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft className="w-3.5 h-3.5" />}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-xs text-slate-500">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
          </Button>
        </div>
      )}

      {safeLogs.length === 0 && (
        <p className="text-center text-slate-600 py-12">No logs found matching filters</p>
      )}
    </div>
  );
};
