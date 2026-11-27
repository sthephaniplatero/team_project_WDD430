import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        </section>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await connection();
  const session = await auth();
  const name = session?.user.name ?? "there";
  const isProfessional = session?.user.role === "PROFESSIONAL";

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-caption font-semibold uppercase tracking-wider text-brand">
        Your Viable account
      </p>
      <h1 className="mt-2 text-ink">Welcome, {name}</h1>
      <p className="mt-3 max-w-2xl text-body text-muted">
        {isProfessional
          ? "Manage your professional profile and the services you offer."
          : "Find a professional and make time for what matters."}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        {isProfessional ? (
          <Link
            href="/dashboard/profile"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            View your profile
          </Link>
        ) : (
          <Link
            href="/professionals"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Find a professional
          </Link>
        )}
      </div>
    </section>
  );
}
