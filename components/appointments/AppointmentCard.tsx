import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { Clock3, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AppointmentSummary } from "@/lib/appointments";
import type { AppointmentStatus } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

const STATUS_BADGE: Record<
  AppointmentStatus,
  { variant: "pending" | "confirmed" | "completed" | "cancelled"; label: string }
> = {
  PENDING: { variant: "pending", label: "Pending" },
  CONFIRMED: { variant: "confirmed", label: "Confirmed" },
  COMPLETED: { variant: "completed", label: "Completed" },
  CANCELLED: { variant: "cancelled", label: "Cancelled" },
};

type AppointmentCardProps = {
  appointment: AppointmentSummary;
  /** Rendered in the card footer, e.g. Reschedule / Cancel buttons (#19). */
  actions?: React.ReactNode;
};

/** Read-only appointment summary: service, other party, date/time, status (SPECIFICATION.md §11.2). */
export function AppointmentCard({ appointment, actions }: AppointmentCardProps) {
  // Shown in the professional's time zone, with its label (§6.1).
  const start = new TZDate(appointment.startTime, appointment.timezone);
  const end = new TZDate(appointment.endTime, appointment.timezone);
  const status = STATUS_BADGE[appointment.status];

  return (
    <article className="flex gap-4 rounded-xl border border-slate-200 bg-card p-5 shadow-sm">
      <time
        dateTime={appointment.startTime}
        className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-50 text-brand"
      >
        <span className="text-caption font-semibold uppercase">{format(start, "MMM")}</span>
        <span className="text-2xl leading-none font-bold">{format(start, "d")}</span>
      </time>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-heading-3 font-semibold text-ink">{appointment.serviceTitle}</h3>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <ul className="flex flex-col gap-1 text-body-sm text-muted">
          <li className="flex items-center gap-2">
            <Clock3 aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            <span>
              {format(start, "EEEE, MMM d")} · {format(start, "h:mm a")} – {format(end, "h:mm a")}{" "}
              <span className="text-caption">({appointment.timezone})</span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <UserRound aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            <span>
              with <span className="font-medium text-ink">{appointment.otherPartyName}</span> ·{" "}
              {appointment.durationMinutes} min · {formatMoney(appointment.price, appointment.currency)}
            </span>
          </li>
        </ul>

        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </article>
  );
}
