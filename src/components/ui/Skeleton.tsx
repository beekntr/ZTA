import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-surface-2 ${className}`} />
);

/** Placeholder rows while a list or table loads. */
export const SkeletonRows: React.FC<{ rows?: number; className?: string }> = ({ rows = 5, className = 'h-9' }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className={className} />
    ))}
  </div>
);
