import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'cta' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-mood-toke-green text-white hover:opacity-90 focus:ring-mood-toke-green shadow-sm hover:shadow-md transition-opacity',
  secondary:
    'bg-white text-brand-700 border-2 border-brand-600 hover:bg-brand-50 focus:ring-brand-500',
  cta:
    'text-white shadow-sm hover:shadow-md focus:ring-orange-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
};

const variantStyles: Partial<Record<Variant, React.CSSProperties>> = {
  cta: { backgroundColor: '#ea580c' },
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-[15px]',
  lg: 'px-8 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={variantStyles[variant]}
      className={`inline-flex items-center justify-center font-semibold rounded-xl
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
      onMouseEnter={variant === 'cta' ? (e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#c2410c'; } : undefined}
      onMouseLeave={variant === 'cta' ? (e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ea580c'; } : undefined}
    >
      {children}
    </button>
  );
}
