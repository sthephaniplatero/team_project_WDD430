import { ArrowRight, CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getUpcomingAppointments } from "@/lib/appointments";
import { getCurrentUser } from "@/lib/auth";

/** Overview: greeting + the user's next 3 upcoming appointments, read-only (SPECIFICATION.md §11.1, US6). */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<GreetingSkeleton />}>
        <Greeting />
      </Suspense>

      <section aria-labelledby="upcoming-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="upcoming-heading" className="text-headline-sm font-semibold text-ink">
            Upcoming appointments
          </h2>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
          >
            View all
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <Suspense fallback={<AppointmentsSkeleton />}>
          <UpcomingAppointments />
        </Suspense>
      </section>
    </div>
  );
}

async function Greeting() {
  const user = await getCurrentUser();
  const firstName = user.name?.split(" ")[0] ?? "there";
  const subtitle =
    user.role === "PROFESSIONAL"
      ? "Here's what's coming up with your clients."
      : "Here's what's coming up on your schedule.";

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-headline-lg-mobile text-ink md:text-headline-lg">Welcome back, {firstName}</h1>
      <p className="text-body text-muted">{subtitle}</p>
    </header>
  );
}

async function UpcomingAppointments() {
  const user = await getCurrentUser();
  const appointments = await getUpcomingAppointments(3);

  if (appointments.length === 0) {
    return user.role === "CLIENT" ? (
      <EmptyState
        icon={<CalendarDays aria-hidden="true" className="size-6" />}
        title="No upcoming appointments"
        description="When you book a session, it will show up here."
        action={
          <Link
            href="/professionals"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Search aria-hidden="true" className="size-4" />
            Find a professional
          </Link>
        }
      />
    ) : (
      <EmptyState
        icon={<CalendarDays aria-hidden="true" className="size-6" />}
        title="No upcoming appointments"
        description="New bookings from your clients will show up here."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          <AppointmentCard appointment={appointment} />
        </li>
      ))}
    </ul>
  );
}

function GreetingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-5 w-64" />
    </div>
  );
}

function AppointmentsSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading appointments">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
