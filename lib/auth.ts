import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { ApiError } from "@/lib/api-response";
import type { Role } from "@/lib/constants";
import type { Session } from "next-auth";

/**
 * Auth.js v5 — Credentials (email + password), JWT sessions, no database adapter.
 * The session exposes user.id and user.role (SPECIFICATION.md §7.1).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        // Returning null makes Auth.js report a generic "CredentialsSignin" error,
        // so we never reveal whether the email exists.
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          role: user.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    // Runs on sign-in (user is set) and on every session read (only token).
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});

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
