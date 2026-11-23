import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-brand">
        <SearchX aria-hidden="true" className="size-8" />
      </span>
      <p className="mt-6 text-caption font-semibold uppercase tracking-wider text-brand">
        404 · Page not found
      </p>
      <h1 className="mt-2 text-ink">This page took a different turn.</h1>
      <p className="mt-3 max-w-md text-body text-muted">
        The page may have moved or the link may be out of date. Let’s get you
        back to where you can find what you need.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to home
      </Link>
    </div>
  );
}
