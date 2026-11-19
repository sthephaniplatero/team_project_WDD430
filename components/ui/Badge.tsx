import {
  Archive,
  BadgeCheck,
  Ban,
  CheckCircle2,
  CircleAlert,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "active"
  | "archived"
  | "success"
  | "warning"
  | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children: ReactNode;
};

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-teal-50 text-teal-800",
  cancelled: "bg-red-50 text-red-700",
  active: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};

const variantIcons: Record<BadgeVariant, LucideIcon> = {
  neutral: CircleAlert,
  confirmed: BadgeCheck,
  pending: Clock3,
  completed: CheckCircle2,
  cancelled: Ban,
  active: CheckCircle2,
  archived: Archive,
  success: CheckCircle2,
  warning: CircleAlert,
  danger: CircleAlert,
};

export function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const Icon = variantIcons[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
      {children}
    </span>
  );
}
