import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSafeCallbackUrl } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Create an account | Viable",
};

type RegisterPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterPageContent({
  searchParams,
}: RegisterPageProps) {
  await connection();
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  const { callbackUrl } = await searchParams;
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-2xl items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-xl border border-outline-variant bg-card p-6 shadow-sm sm:p-9">
        <p className="text-caption font-semibold uppercase tracking-wider text-brand">
          Start with Viable
        </p>
        <h1 className="mt-2 text-ink">Create your account</h1>
        <p className="mt-3 mb-7 text-sm text-muted">
          Join as a client or professional and make time for what matters.
        </p>
        <RegisterForm callbackUrl={getSafeCallbackUrl(callbackUrl)} />
      </div>
    </section>
  );
}

function RegisterPageFallback() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-2xl items-center px-4 py-12 sm:px-6">
      <div className="h-[42rem] w-full animate-pulse rounded-xl bg-slate-100" />
    </section>
  );
}
