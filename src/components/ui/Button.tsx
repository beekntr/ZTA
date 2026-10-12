import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'border-transparent bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'border-line-strong bg-surface text-fg hover:bg-surface-2',
  ghost: 'border-transparent bg-transparent text-fg-2 hover:bg-surface-2 hover:text-fg',
  danger: 'border-line-strong bg-surface text-critical hover:border-transparent hover:bg-critical-soft',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};

const ICON_ONLY: Record<Size, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border font-medium transition-colors
        ${VARIANT_STYLES[variant]} ${children ? SIZE_STYLES[size] : ICON_ONLY[size]}
        ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {children}
    </button>
  );
};
