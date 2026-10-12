import React from 'react';

interface TrustScoreCircleProps {
  score: number;
  size?: number;
}

/** Meter: the arc's color carries severity, the number stays in text color. */
export const TrustScoreCircle: React.FC<TrustScoreCircleProps> = ({ score, size = 52 }) => {
  const stroke = size >= 64 ? 6 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const color = score > 70 ? 'var(--good-mark)' : score > 30 ? 'var(--warning-mark)' : 'var(--critical-mark)';

  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Trust score"
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} style={{ stroke: 'var(--surface-2)' }} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          style={{ stroke: color, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className={`absolute font-semibold text-fg ${size >= 64 ? 'text-lg' : 'text-sm'}`}>{score}</span>
    </div>
  );
};
