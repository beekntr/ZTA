import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl border border-[#1e2a45] bg-[#0f1629]/80
        backdrop-blur-sm p-4
        transition-all duration-300
        ${glow ? 'shadow-lg shadow-cyan-500/10 border-cyan-500/30' : ''}
        ${onClick ? 'cursor-pointer hover:border-cyan-500/40 hover:shadow-cyan-500/15' : 'hover:border-[#2a3a5e]'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, icon, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {icon && <div className="text-cyan-400">{icon}</div>}
      <div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
