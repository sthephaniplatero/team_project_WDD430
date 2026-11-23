import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "teal"
  | "outline"
  | "ghost"
  | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-teal-800 focus-visible:ring-brand",
  teal: "bg-brand text-white hover:bg-teal-800 focus-visible:ring-brand",
  outline:
    "border border-slate-300 bg-card text-ink hover:bg-slate-50 focus-visible:ring-brand",
  ghost: "bg-transparent text-ink hover:bg-slate-100 focus-visible:ring-brand",
  destructive:
    "bg-danger text-white hover:bg-red-700 focus-visible:ring-danger",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      )}
      {children}
    </button>
  );
}
