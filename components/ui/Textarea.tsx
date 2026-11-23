import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`min-h-28 w-full resize-y rounded-md border border-outline-variant bg-card px-3 py-2 text-body-md text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-teal-border disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
      {...props}
    />
  );
}
