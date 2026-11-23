import { Suspense } from "react";
import { ServicesManager } from "@/components/services/ServicesManager";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProfessionalUser } from "@/lib/auth";
import { listServicesByProfessional } from "@/lib/services";

/** Services CRUD (US2). Professional-only: clients are redirected to /dashboard (§11.1). */
export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}

async function ServicesContent() {
  const user = await getProfessionalUser();
  const services = await listServicesByProfessional(user.id);
  return <ServicesManager services={services} />;
}

function ServicesSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading services">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-md" />
        ))}
      </div>
    </div>
  );
}
