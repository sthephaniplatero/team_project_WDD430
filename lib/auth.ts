import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api-response";
import type { Role } from "@/lib/constants";
import type { Session } from "next-auth";
import { auth } from "@/auth";

/**
 * Auth.js v5 is configured once, in /auth.ts (+ /auth.config.ts). This module
 * re-exports it and adds the session helpers used by API routes and dashboard
 * pages. The session exposes user.id and user.role (SPECIFICATION.md §7.1).
 */
export { auth, handlers, signIn, signOut } from "@/auth";

export type SessionUser = Session["user"];

/**
 * Returns the signed-in user or throws ApiError 401.
 * Use in Route Handlers / Server Actions together with handleApiError():
 *
 *   try {
 *     const user = await requireUser();
 *     ...
 *   } catch (e) {
 *     return handleApiError(e);
 *   }
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("UNAUTHORIZED", "You must be signed in");
  }
  return session.user;
}

/**
 * Returns the signed-in user if they have `role`.
 * Throws ApiError 401 when signed out, 403 when the role does not match.
 */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) {
    throw new ApiError("FORBIDDEN", `Only ${role.toLowerCase()} accounts can do this`);
  }
  return user;
}

/**
 * Page-level session check for Server Components (dashboard pages and layout).
 * Redirects to /login when signed out; memoized per request, so the layout and
 * the page can both call it without reading the session twice.
 *
 * It reads cookies, so with cacheComponents the caller must render inside <Suspense>.
 * Layouts don't re-render on navigation: every dashboard page must call this too.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser> => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
});

/**
 * Like getCurrentUser, but for professional-only pages (/dashboard/services,
 * /dashboard/profile): clients are sent back to /dashboard (SPECIFICATION.md §11.1).
 */
export async function getProfessionalUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user.role !== "PROFESSIONAL") {
    redirect("/dashboard");
  }
  return user;
}
