import { CalendarDays } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 font-semibold text-ink"
        >
          <CalendarDays aria-hidden="true" className="size-5 text-brand" />
          Viable
        </Link>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
          <Link
            href="/professionals"
            className="text-sm text-muted transition-colors hover:text-brand"
          >
            Find a professional
          </Link>
          <Link
            href="/register"
            className="text-sm text-muted transition-colors hover:text-brand"
          >
            Offer your services
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted transition-colors hover:text-brand"
          >
            Log in
          </Link>
        </nav>
        <p className="text-caption text-muted">
          © Viable. Make time for what matters.
        </p>
      </div>
    </footer>
  );
}
