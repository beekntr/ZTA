import { format, formatDistanceToNow, parseISO } from 'date-fns';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const grouped = new Intl.NumberFormat('en');

/** 1,284 · 52.1K · 4.6M — full digits below 10,000, compact above. */
export function formatCompact(value: number): string {
  return Math.abs(value) < 10_000 ? grouped.format(value) : compact.format(value);
}

/** 4,569,645 */
export function formatNumber(value: number): string {
  return grouped.format(value);
}

/** Format an ISO timestamp; falls back to the raw text if it can't be parsed. */
export function formatTime(iso: string | null | undefined, pattern: string): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

/** "30m ago", "3h ago", "2d ago" — for narrow columns. */
export function timeAgoShort(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const then = parseISO(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const minutes = Math.round((Date.now() - then) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

/** "3 minutes ago" */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'never';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}
