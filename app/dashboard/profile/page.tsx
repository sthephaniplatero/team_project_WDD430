import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProfessionalUser } from "@/lib/auth";

// Professional-only: clients are redirected to /dashboard (SPECIFICATION.md §11.1).
// Placeholder: ProfileForm + WorkingHoursEditor come in #20 (Week 06).
export default function ProfilePage() {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await getProfessionalUser();
  return (
    <h1 className="text-headline-lg-mobile text-ink md:text-headline-lg">Profile</h1>
  );
}
