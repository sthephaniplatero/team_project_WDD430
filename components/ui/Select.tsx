import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`min-h-12 w-full rounded-md border border-outline-variant bg-card px-3 py-2 text-body-md text-ink focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-teal-border disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
