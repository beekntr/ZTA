import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'danger' | 'ghost' | 'success' | 'warning';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400/60 hover:shadow-cyan-500/20',
  danger:
    'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 hover:border-red-400/60 hover:shadow-red-500/20',
  ghost:
    'bg-transparent text-slate-400 border border-slate-600/40 hover:bg-slate-700/30 hover:text-slate-300 hover:border-slate-500/60',
  success:
    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-400/60',
  warning:
    'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-400/60',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 shadow-sm hover:shadow-md
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
    </button>
  );
};
