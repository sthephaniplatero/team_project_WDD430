"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import type { Session } from "next-auth";
import { Avatar } from "@/components/ui/Avatar";

type UserMenuProps = {
  user: Session["user"];
  onNavigate?: () => void;
  mobile?: boolean;
};

export function UserMenu({ user, onNavigate, mobile = false }: UserMenuProps) {
  return (
    <div
      className={`flex items-center gap-3 ${
        mobile ? "border-t border-slate-200 pt-4" : ""
      }`}
    >
      <Avatar name={user.name ?? "Viable user"} src={user.image} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
        {user.name ?? "Account"}
      </span>
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="rounded-md px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span className={mobile ? "" : "sr-only"}>Sign out</span>
      </button>
    </div>
  );
}
