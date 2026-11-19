import { ArrowRight, CalendarCheck2, Check } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="absolute -right-36 -top-40 -z-10 size-[34rem] rounded-full bg-teal-100/70 blur-3xl"
      />
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3 py-1.5 text-caption font-medium text-brand">
            <span className="size-2 rounded-full bg-success" />
            A simpler way to book great work
          </p>
          <h1 className="max-w-xl text-display-mobile text-ink sm:text-display">
            Make time for the work that moves you forward.
          </h1>
          <p className="mt-5 max-w-xl text-body-lg text-muted">
            Find trusted independent professionals, see their services, and book
            a time that fits your life — all in one calm, clear place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/professionals"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Find a professional
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-outline-variant bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              I offer a service
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-caption font-medium text-slate-600">
            <li className="inline-flex items-center gap-2">
              <Check aria-hidden="true" className="size-4 text-brand" />
              Clear prices and availability
            </li>
            <li className="inline-flex items-center gap-2">
              <Check aria-hidden="true" className="size-4 text-brand" />
              Book on your schedule
            </li>
          </ul>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-2xl border border-white bg-white/80 p-3 shadow-xl shadow-teal-900/10 sm:p-5">
            <div className="rounded-md bg-surface-container-low p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-caption font-medium text-muted">
                    YOUR NEXT GOOD THING
                  </p>
                  <h2 className="mt-2 text-ink">A little more in sync.</h2>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-brand">
                  <CalendarCheck2 aria-hidden="true" className="size-6" />
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  ["Discover", "Explore professionals and their services"],
                  ["Choose", "Find a time that works for you"],
                  ["Book", "Keep your plans together in one place"],
                ].map(([title, detail], index) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-md border border-outline-variant bg-card p-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-brand">
                      0{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{title}</p>
                      <p className="mt-0.5 text-caption text-muted">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-caption text-muted">
                Thoughtful bookings start with a little clarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
