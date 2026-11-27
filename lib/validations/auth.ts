import { z } from "zod";
import { ROLES } from "@/lib/constants";

export const userRoleSchema = z.enum(ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

/** Sign-up form + POST /api/auth/register. */
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  role: userRoleSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
