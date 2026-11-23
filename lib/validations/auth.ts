import { z } from "zod";
import { ROLES } from "@/lib/constants";

/** Sign-up form + POST /api/auth/register. */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    // bcrypt only uses the first 72 bytes
    .max(72, "Password must be at most 72 characters"),
  role: z.enum(ROLES, { error: "Choose PROFESSIONAL or CLIENT" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Sign-in form + Credentials provider. */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
