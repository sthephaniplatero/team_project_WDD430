/**
 * Shared enums from SPECIFICATION.md §9.
 * No dependencies, so Client Components, Zod schemas and Mongoose models can all import it.
 */

export const ROLES = ["PROFESSIONAL", "CLIENT"] as const;
export type Role = (typeof ROLES)[number];

export const CATEGORIES = ["tutoring", "therapy", "consulting", "coaching", "fitness", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const DURATIONS = [15, 30, 45, 60, 90] as const;
export type DurationMinutes = (typeof DURATIONS)[number];

export const CURRENCIES = ["USD", "KES"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Defaults applied to a professional's embedded profile (§9.1). */
export const PROFESSIONAL_PROFILE_DEFAULTS = {
  headline: "",
  bio: "",
  category: "other",
  workingDays: [1, 2, 3, 4, 5],
  workingHoursStart: "09:00",
  workingHoursEnd: "17:00",
  timezone: "Africa/Nairobi",
} as const satisfies {
  headline: string;
  bio: string;
  category: Category;
  workingDays: readonly number[];
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
};

/** "HH:mm", 00:00–23:59 */
export const TIME_HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
