import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Tables inside use -mx-5 to run edge to edge, which assumes the default. */
  padding?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'p-5' }) => (
  <section className={`rounded-xl border border-line bg-surface shadow-card ${padding} ${className}`}>
    {children}
  </section>
);

interface CardHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-start justify-between gap-4">
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
