import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-6 rounded-xl bg-brand px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:px-14">
        <div className="max-w-2xl">
          <p className="text-caption font-semibold uppercase tracking-wider text-teal-100">
            Your next step starts here
          </p>
          <h2 className="mt-3 text-headline-lg-mobile font-semibold text-white sm:text-headline-lg">
            Ready to make a little room for you?
          </h2>
          <p className="mt-3 text-sm leading-6 text-teal-50 sm:text-base">
            Find the right professional or bring your services to Viable.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/professionals"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          >
            Explore professionals
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Join as a professional
          </Link>
        </div>
      </div>
    </section>
  );
}
