import { z } from "zod";
import { CURRENCIES, DURATIONS } from "@/lib/constants";

/** Highest accepted price in minor units (10,000,000.00): blocks typos like an extra few zeros. */
export const MAX_PRICE_MINOR = 1_000_000_000;

/**
 * Body of POST /api/services and PUT /api/services/:id (SPECIFICATION.md §9.2).
 * `price` is already in minor units (2500 = 25.00): the form converts the
 * decimal the user typed with toMinorUnits() before sending it.
 */
export const serviceSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be at most 80 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .default(""),
  durationMinutes: z.union(
    DURATIONS.map((d) => z.literal(d)),
    { error: `Duration must be one of ${DURATIONS.join(", ")} minutes` },
  ),
  price: z
    .number({ error: "Price is required" })
    .int("Price must be a whole number of cents")
    .min(0, "Price can't be negative")
    .max(MAX_PRICE_MINOR, "Price is too high"),
  currency: z.enum(CURRENCIES, { error: `Currency must be ${CURRENCIES.join(" or ")}` }).default("USD"),
  /** Only used by PUT, to restore an archived service. New services are always active. */
  isActive: z.boolean().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

/**
 * ServiceFormModal fields, as the user types them: the price is a decimal
 * string ("25.50") and the duration comes from a <select> as a string.
 * Convert with toServiceInput() before sending to the API.
 */
export const serviceFormSchema = z.object({
  title: serviceSchema.shape.title,
  description: z.string().trim().max(500, "Description must be at most 500 characters"),
  durationMinutes: z
    .string()
    .refine((v) => DURATIONS.some((d) => String(d) === v), "Choose a duration"),
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a price like 25 or 25.50")
    .refine((v) => Math.round(Number(v) * 100) <= MAX_PRICE_MINOR, "Price is too high"),
  currency: z.enum(CURRENCIES, { error: "Choose a currency" }),
  isActive: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
