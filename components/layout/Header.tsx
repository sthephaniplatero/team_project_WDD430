"use client";

import { CalendarDays, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navigation = [{ href: "/professionals", label: "Find a professional" }];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Viable home"
          onClick={closeMenu}
          className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-ink"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          Viable
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Get started
            </Link>
          </div>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-md p-2 text-ink transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-card px-4 py-4 shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-md px-3 py-3 text-sm font-medium text-ink hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 text-sm font-semibold text-ink hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={closeMenu}
              className="rounded-md bg-accent px-3 py-3 text-center text-sm font-semibold text-ink hover:bg-amber-400"
            >
              Get started
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
