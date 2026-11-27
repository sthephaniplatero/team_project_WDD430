import { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCurrentUser } from "@/lib/auth";

/**
 * Dashboard shell: role-aware sidebar (bottom bar below 768px) + page content.
 *
 * The session is read inside <Suspense> (required by cacheComponents), so the
 * shell streams first. This check is not enough on its own: layouts don't
 * re-render on navigation, so each dashboard page also calls getCurrentUser()
 * (or getProfessionalUser() for professional-only pages).
 */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarForCurrentUser />
      </Suspense>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:p-8 lg:p-10">{children}</div>
    </div>
  );
}

async function SidebarForCurrentUser() {
  const user = await getCurrentUser();
  // Pass only what the sidebar shows, never the raw session.
  return (
    <DashboardSidebar
      user={{
        name: user.name ?? user.email ?? "Account",
        email: user.email ?? "",
        image: user.image ?? null,
        role: user.role,
      }}
    />
  );
}

function SidebarSkeleton() {
  return (
    <>
      <div className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col gap-2 border-r border-slate-200 bg-card p-4 md:flex">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <div
        data-dashboard-bottom-nav
        className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-slate-200 bg-card md:hidden"
      />
    </>
  );
}
