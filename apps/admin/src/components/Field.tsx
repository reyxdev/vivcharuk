import type { InputHTMLAttributes } from 'react';

export function Field({ label, ...input }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-body-sm font-medium text-text-primary">
      {label}
      <input
        {...input}
        className="rounded-lg border border-border-control bg-bg-input px-3 py-2.5 text-body font-normal text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
    </label>
  );
}
