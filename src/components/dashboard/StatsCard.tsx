import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'cyan' | 'red' | 'amber' | 'emerald';
  loading?: boolean;
}

const COLOR_MAP = {
  cyan: {
    icon: 'text-cyan-400',
    glow: 'shadow-cyan-500/10',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/10',
    trend: 'text-cyan-400',
  },
  red: {
    icon: 'text-red-400',
    glow: 'shadow-red-500/10',
    border: 'border-red-500/20',
    bg: 'bg-red-500/10',
    trend: 'text-red-400',
  },
  amber: {
    icon: 'text-amber-400',
    glow: 'shadow-amber-500/10',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    trend: 'text-amber-400',
  },
  emerald: {
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    trend: 'text-emerald-400',
  },
};

function useAnimatedCount(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend = 'neutral',
  trendValue,
  color = 'cyan',
  loading = false,
}) => {
  const animated = useAnimatedCount(value);
  const colors = COLOR_MAP[color];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-slate-500';

  if (loading) {
    return (
      <div className="rounded-xl border border-[#1e2a45] bg-[#0f1629]/80 p-5 animate-pulse space-y-3">
        <div className="h-4 bg-[#1e2a45] rounded w-1/2" />
        <div className="h-8 bg-[#1e2a45] rounded w-3/4" />
        <div className="h-3 bg-[#1e2a45] rounded w-1/3" />
      </div>
    );
  }

  return (
    <div
      className={`
        relative rounded-xl border ${colors.border} bg-[#0f1629]/80 backdrop-blur-sm p-5
        shadow-lg ${colors.glow} hover:shadow-xl transition-all duration-300
        hover:border-opacity-60 group overflow-hidden
      `}
    >
      {/* Background glow */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 ${colors.bg} rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${colors.icon} font-mono`}>
            {animated.toLocaleString()}
          </p>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.icon}`}>{icon}</div>
      </div>
    </div>
  );
};
