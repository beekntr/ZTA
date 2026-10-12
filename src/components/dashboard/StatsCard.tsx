import React, { useEffect, useRef, useState } from 'react';
import { formatCompact } from '../../lib/format';

interface StatsCardProps {
  label: string;
  value: number;
  hint?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

function useAnimatedCount(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + diff * eased);
      prevRef.current = value; // an interrupted animation resumes from here
      setCount(value);
      if (progress < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

/** Stat tile: label, one big number, a short hint. */
export const StatsCard: React.FC<StatsCardProps> = ({ label, value, hint, icon, loading = false }) => {
  const animated = useAnimatedCount(value);

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-fg-2">{label}</p>
        {icon && (
          <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted sm:grid [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-8 w-24 animate-pulse rounded-md bg-surface-2" />
          <div className="h-3 w-32 animate-pulse rounded bg-surface-2" />
        </div>
      ) : (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-fg" title={value.toLocaleString()}>
            {formatCompact(animated)}
          </p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </>
      )}
    </div>
  );
};
