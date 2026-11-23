import { CalendarDays, Search, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find your person",
    description:
      "Browse independent professionals and discover services that fit what you need.",
    icon: Search,
  },
  {
    number: "02",
    title: "Pick a time",
    description:
      "See the service details and choose from the times your professional has available.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Feel ready",
    description:
      "Your appointment details stay in one place, so you can focus on what comes next.",
    icon: Sparkles,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-card py-16 sm:py-20">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-caption font-semibold uppercase tracking-wider text-brand">
            Easy from the start
          </p>
          <h2 className="mt-3 text-ink">A better way to make it happen.</h2>
          <p className="mt-3 text-body text-muted">
            Less back-and-forth. More time for the things you came to do.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article
              key={number}
              className="rounded-md border border-outline-variant bg-surface-container-lowest p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-brand">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="text-caption font-semibold text-slate-400">
                  {number}
                </span>
              </div>
              <h3 className="mt-5 text-ink">{title}</h3>
              <p className="mt-2 text-body text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
