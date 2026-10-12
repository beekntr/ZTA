import React from 'react';
import { formatNumber } from '../../lib/format';

export interface BarListItem {
  key: string;
  label: React.ReactNode;
  value: number;
}

interface BarListProps {
  items: BarListItem[];
  /** Show each value's share of this total next to it. */
  total?: number;
  emptyText?: string;
}

function share(value: number, total: number): string {
  const pct = (value / total) * 100;
  return pct > 0 && pct < 1 ? '<1%' : `${Math.round(pct)}%`;
}

/** Ranked horizontal bars: one series, so one color, values written out. */
export const BarList: React.FC<BarListProps> = ({ items, total, emptyText = 'No data yet' }) => {
  if (items.length === 0) return <p className="py-8 text-center text-sm text-muted">{emptyText}</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-fg">{item.label}</span>
            <span className="shrink-0 text-xs tabular-nums text-fg-2">
              {formatNumber(item.value)}
              {total ? <span className="ml-1.5 text-muted">{share(item.value, total)}</span> : null}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-chart-1"
              style={{ width: `${Math.max(1.5, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
