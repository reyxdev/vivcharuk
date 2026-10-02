import type { ButtonHTMLAttributes } from 'react';

export function Button({ variant = 'primary', className = '', ...rest }: { variant?: 'primary' | 'ghost' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-body-sm font-semibold transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
  const look = variant === 'primary' ? 'bg-accent text-bg-page hover:brightness-110' : 'border border-border-control text-text-primary hover:bg-bg-raised';
  return <button {...rest} className={`${base} ${look} ${className}`} />;
}
