import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-card px-6 py-10 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-teal-50 text-brand">
        {icon ?? <Inbox aria-hidden="true" className="size-6" />}
      </span>
      <h2 className="text-heading-3 font-semibold text-ink">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-body text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
