import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeCallbackUrl } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Log in | Viable",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({ searchParams }: LoginPageProps) {
  await connection();
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  const { callbackUrl } = await searchParams;
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-xl border border-outline-variant bg-card p-6 shadow-sm sm:p-9">
        <p className="text-caption font-semibold uppercase tracking-wider text-brand">
          Welcome back
        </p>
        <h1 className="mt-2 text-ink">Log in to Viable</h1>
        <p className="mt-3 mb-7 text-sm text-muted">
          Sign in to manage your appointments and services.
        </p>
        <LoginForm callbackUrl={getSafeCallbackUrl(callbackUrl)} />
      </div>
    </section>
  );
}

function LoginPageFallback() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-12 sm:px-6">
      <div className="h-[26rem] w-full animate-pulse rounded-xl bg-slate-100" />
    </section>
  );
}
