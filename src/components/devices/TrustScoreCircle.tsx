import React from 'react';

interface TrustScoreCircleProps {
  score: number;
  size?: number;
}

export const TrustScoreCircle: React.FC<TrustScoreCircleProps> = ({ score, size = 72 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const dashOffset = circumference - (progress / 100) * circumference;

  const color =
    score > 70
      ? '#00ff88'
      : score > 30
        ? '#ffaa00'
        : '#ff3366';

  const glow =
    score > 70
      ? 'drop-shadow(0 0 6px rgba(0,255,136,0.5))'
      : score > 30
        ? 'drop-shadow(0 0 6px rgba(255,170,0,0.5))'
        : 'drop-shadow(0 0 6px rgba(255,51,102,0.5))';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2a45"
          strokeWidth="6"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ filter: glow, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold font-mono"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
};
