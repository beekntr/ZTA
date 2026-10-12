import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SkeletonRows } from '../ui/Skeleton';
import { formatNumber, formatTime } from '../../lib/format';
import type { Log } from '../../types';

interface Props {
  logs: Log[];
  onIpClick?: (ip: string) => void;
  loading?: boolean;
}

const PAGE_SIZE = 50;

function csvCell(value: unknown): string {
  let s = String(value ?? '');
  // A leading = + - @ makes spreadsheets run the cell as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

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
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zta-logs-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const HEADERS = ['Time', 'Type', 'Source', 'Destination', 'Protocol', 'Port', 'Interface', ''];

export const LogTable: React.FC<Props> = ({ logs, onIpClick, loading }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const safeLogs = Array.isArray(logs) ? logs : [];
  const totalPages = Math.ceil(safeLogs.length / PAGE_SIZE);
  const pageLogs = safeLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) return <SkeletonRows rows={10} />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-fg-2">
          <span className="font-medium tabular-nums text-fg">{formatNumber(safeLogs.length)}</span> events
          {totalPages > 1 && <span className="text-muted"> · page {page + 1} of {totalPages}</span>}
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="h-3.5 w-3.5" />}
          onClick={() => exportCsv(safeLogs)}
          disabled={safeLogs.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <div className="-mx-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              {HEADERS.map((h, i) => (
                <th key={h || i} className={`whitespace-nowrap pb-2 pr-4 font-medium ${i === 0 ? 'pl-5' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageLogs.map((log) => {
              const open = expanded === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr
                    className={`cursor-pointer border-t border-line transition-colors hover:bg-surface-2 ${open ? 'bg-surface-2' : ''}`}
                    onClick={() => setExpanded(open ? null : log.id)}
                  >
                    <td className="whitespace-nowrap py-2.5 pl-5 pr-4 text-xs tabular-nums text-fg-2">
                      {formatTime(log.timestamp, 'dd MMM HH:mm:ss')}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge type={log.log_type} />
                    </td>
                    <td className="py-2.5 pr-4">
                      <button
                        className="font-mono text-xs text-accent-text hover:underline"
                        title="Show only this source"
                        onClick={(e) => {
                          e.stopPropagation();
                          onIpClick?.(log.src_ip);
                        }}
                      >
                        {log.src_ip}
                      </button>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-fg-2">{log.dst_ip}</td>
                    <td className="py-2.5 pr-4 text-xs uppercase text-fg-2">{log.protocol}</td>
                    <td className="py-2.5 pr-4 text-xs tabular-nums text-fg-2">{log.dst_port ?? log.src_port ?? '—'}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted">{log.in_iface}</td>
                    <td className="py-2.5 pr-5 text-muted">
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                  </tr>
                  {open && (
                    <tr className="bg-surface-2">
                      <td colSpan={HEADERS.length} className="px-5 pb-4 pt-1">
                        <p className="mb-1.5 text-xs font-medium text-muted">Raw kernel log</p>
                        <pre className="whitespace-pre-wrap break-all rounded-lg border border-line bg-surface p-3 font-mono text-xs leading-relaxed text-fg-2">
                          {log.raw_log}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {safeLogs.length === 0 && <p className="py-12 text-center text-sm text-muted">No events match these filters</p>}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft className="h-3.5 w-3.5" />}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
