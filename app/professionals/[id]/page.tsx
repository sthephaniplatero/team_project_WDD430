import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProfileHeader } from "@/components/professionals/ProfileHeader";
import { ServiceList } from "@/components/services/ServiceList";
import { formatMoney } from "@/lib/money";
import { getProfessionalProfile } from "@/lib/professionals";

type ProfessionalPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProfessionalPageProps): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const professional = await getProfessionalProfile(id);

  if (!professional) {
    return { title: "Professional not found | Viable" };
  }

  return {
    title: `${professional.name} | Viable`,
    description:
      professional.profile.headline ||
      `Explore services offered by ${professional.name}.`,
  };
}

export default function ProfessionalPage({
  params,
}: ProfessionalPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
        </div>
      }
    >
      <ProfessionalProfile params={params} />
    </Suspense>
  );
}

async function ProfessionalProfile({
  params,
}: ProfessionalPageProps) {
  await connection();
  const { id } = await params;
  const professional = await getProfessionalProfile(id);

  if (!professional) {
    notFound();
  }

  const services = professional.services.map((service) => ({
    serviceId: service.serviceId,
    title: service.title,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceLabel: formatMoney(service.price, service.currency),
    isActive: true,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <ProfileHeader professional={professional} />
      <section className="mt-10" aria-labelledby="services-heading">
        <div className="mb-5">
          <p className="text-caption font-semibold uppercase tracking-wider text-brand">
            What I offer
          </p>
          <h2 id="services-heading" className="mt-1 text-ink">
            Services
          </h2>
        </div>
        <ServiceList
          services={services}
          mode="public"
          emptyTitle="Services coming soon"
          emptyDescription="This professional has not published any services yet."
        />
      </section>
      <section id="booking" aria-label="Booking" />
    </div>
  );
}
