"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/dashboard/actions";
import { Avatar } from "@/components/ui/Avatar";
import type { Role } from "@/lib/constants";

type NavItem = { href: string; label: string; icon: LucideIcon };

/** Role-aware navigation (SPECIFICATION.md §11.2). */
const NAV_ITEMS: Record<Role, NavItem[]> = {
  PROFESSIONAL: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/dashboard/services", label: "Services", icon: BriefcaseBusiness },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  CLIENT: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/professionals", label: "Find professionals", icon: Search },
  ],
};

export type DashboardSidebarUser = {
  name: string;
  email: string;
  image: string | null;
  role: Role;
};

function isActive(pathname: string, href: string) {
  // "/dashboard" must match exactly, or it would stay active on every sub-page.
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ user }: { user: DashboardSidebarUser }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[user.role];
  const roleLabel = user.role === "PROFESSIONAL" ? "Professional" : "Client";

  return (
    <>
      {/* Desktop (≥768px): persistent left sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r border-slate-200 bg-card md:flex">
        <nav aria-label="Dashboard navigation" className="flex flex-1 flex-col gap-1 p-4">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                  active
                    ? "bg-teal-50 text-brand"
                    : "text-muted hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.image} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{roleLabel}</p>
            </div>
          </div>
          <form action={signOutAction} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              <LogOut aria-hidden="true" className="size-5" strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile (<768px): bottom navigation bar */}
      <nav
        aria-label="Dashboard navigation"
        data-dashboard-bottom-nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="flex">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
                    active ? "text-brand" : "text-muted"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-5" strokeWidth={active ? 2 : 1.75} />
                  <span className="max-w-full truncate px-1">{label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <form action={signOutAction} className="h-full">
              <button
                type="submit"
                className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
              >
                <LogOut aria-hidden="true" className="size-5" strokeWidth={1.75} />
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </>
  );
}
