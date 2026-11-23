import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`min-h-12 w-full rounded-md border border-outline-variant bg-card px-3 py-2 text-body-md text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-teal-border disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
      {...props}
    />
  );
}
