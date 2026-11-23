/**
 * Availability engine — SPECIFICATION.md §6.1.
 *
 * Pure functions only: no database, no `Date.now()`. Callers pass "now" in,
 * which keeps the logic deterministic and unit-testable, and lets the same code
 * run in Route Handlers (#18) and Client Components (BookingCalendar).
 *
 * Conventions
 * - A "date key" is a calendar day in the professional's timezone: "YYYY-MM-DD".
 * - A "time" is a wall-clock time in the professional's timezone: "HH:mm".
 * - Appointment instants (`startTime` / `endTime`) are absolute `Date`s (stored in UTC).
 */
import { TZDate } from "@date-fns/tz";

/** Bookings can be made from today up to this many days ahead (§6.1 rule 1). */
export const BOOKING_WINDOW_DAYS = 60;

/** Appointment statuses that block a slot (§6.1 rule 4). */
const BLOCKING_STATUSES = new Set(["PENDING", "CONFIRMED"]);

const DATE_KEY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

export interface ExistingAppointment {
  startTime: Date;
  endTime: Date;
  /** When omitted the appointment is treated as blocking. */
  status?: string;
}

export interface AvailabilityInput {
  /** 0–6 (Sun–Sat), from `professionalProfile.workingDays`. */
  workingDays: readonly number[];
  /** "HH:mm", from `professionalProfile.workingHoursStart`. */
  workingHoursStart: string;
  /** "HH:mm", from `professionalProfile.workingHoursEnd`. */
  workingHoursEnd: string;
  /** IANA name, e.g. "Africa/Nairobi". */
  timezone: string;
  /** Duration of the selected service, in minutes. */
  durationMinutes: number;
  /** The day to compute slots for, "YYYY-MM-DD" in the professional's timezone. */
  date: string;
  /** The professional's appointments that may touch this day. */
  appointments: readonly ExistingAppointment[];
  /** The current instant. */
  now: Date;
}

export interface TimeSlot {
  /** "HH:mm" in the professional's timezone. */
  time: string;
  /** `false` when the slot overlaps a PENDING or CONFIRMED appointment. */
  available: boolean;
}

interface DateParts {
  year: number;
  month: number; // 1–12
  day: number;
}

/** Parses "YYYY-MM-DD"; returns `null` for malformed or impossible dates (e.g. 2026-02-30). */
export function parseDateKey(date: string): DateParts | null {
  const match = DATE_KEY_REGEX.exec(date);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** Converts "HH:mm" to minutes after midnight; `null` if malformed. */
export function timeToMinutes(time: string): number | null {
  const match = TIME_REGEX.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Day number since the Unix epoch for a calendar date (timezone-independent). */
function epochDay({ year, month, day }: DateParts): number {
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/** Today's calendar date in the given timezone, as "YYYY-MM-DD". */
export function todayInTimezone(timezone: string, now: Date): string {
  const zoned = new TZDate(now.getTime(), timezone);
  return `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}`;
}

/** Adds whole days to a date key: addDaysToDateKey("2026-12-31", 1) === "2027-01-01". */
export function addDaysToDateKey(date: string, days: number): string {
  const parts = parseDateKey(date);
  if (!parts) throw new RangeError(`Invalid date key: ${date}`);
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Day of week (0 = Sunday … 6 = Saturday) of a date key. */
export function dayOfWeek(date: string): number {
  const parts = parseDateKey(date);
  if (!parts) throw new RangeError(`Invalid date key: ${date}`);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

/**
 * Converts a wall-clock slot in the professional's timezone to an absolute instant.
 * Use it to turn a picked slot ("2026-11-20" + "09:30") into `startTime` for the API.
 */
export function slotToDate(date: string, time: string, timezone: string): Date {
  const parts = parseDateKey(date);
  const minutes = timeToMinutes(time);
  if (!parts || minutes === null) {
    throw new RangeError(`Invalid slot: ${date} ${time}`);
  }
  const zoned = new TZDate(
    parts.year,
    parts.month - 1,
    parts.day,
    Math.floor(minutes / 60),
    minutes % 60,
    timezone,
  );
  return new Date(zoned.getTime());
}

/** Two time ranges overlap when existing.start < new.end && existing.end > new.start (§6.1 rule 4). */
export function rangesOverlap(
  existing: { startTime: Date; endTime: Date },
  candidate: { startTime: Date; endTime: Date },
): boolean {
  return (
    existing.startTime.getTime() < candidate.endTime.getTime() &&
    existing.endTime.getTime() > candidate.startTime.getTime()
  );
}

/**
 * Whether a calendar day can be booked at all (§6.1 rule 1): it is a working day
 * and lies between today and today + 60 days, in the professional's timezone.
 * Used by BookingCalendar to disable days.
 */
export function isBookableDate(
  date: string,
  workingDays: readonly number[],
  timezone: string,
  now: Date,
): boolean {
  const parts = parseDateKey(date);
  const todayParts = parseDateKey(todayInTimezone(timezone, now));
  if (!parts || !todayParts) return false;

  const offset = epochDay(parts) - epochDay(todayParts);
  if (offset < 0 || offset > BOOKING_WINDOW_DAYS) return false;

  return workingDays.includes(dayOfWeek(date));
}

/**
 * Every slot of the day that is still in the future, flagged available or not.
 * Returns `[]` for a non-bookable day or invalid working hours / duration.
 * Slots that have already started today are hidden (§6.1 rule 3).
 */
export function getDaySlots(input: AvailabilityInput): TimeSlot[] {
  const {
    workingDays,
    workingHoursStart,
    workingHoursEnd,
    timezone,
    durationMinutes,
    date,
    appointments,
    now,
  } = input;

  if (!isBookableDate(date, workingDays, timezone, now)) return [];

  const open = timeToMinutes(workingHoursStart);
  const close = timeToMinutes(workingHoursEnd);
  if (open === null || close === null || close <= open) return [];
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) return [];

  const blocking = appointments.filter(
    (a) => a.status === undefined || BLOCKING_STATUSES.has(a.status),
  );

  const slots: TimeSlot[] = [];
  // Rule 2: start at opening time, step by the service duration, end at or before closing.
  for (let start = open; start + durationMinutes <= close; start += durationMinutes) {
    const time = minutesToTime(start);
    const startTime = slotToDate(date, time, timezone);
    const endTime = new Date(startTime.getTime() + durationMinutes * MS_PER_MINUTE);

    // Rule 3: only slots that start in the future.
    if (startTime.getTime() <= now.getTime()) continue;

    // Rule 4: no overlap with a PENDING or CONFIRMED appointment.
    const available = !blocking.some((a) => rangesOverlap(a, { startTime, endTime }));
    slots.push({ time, available });
  }
  return slots;
}

/**
 * The free slots for a day as "HH:mm" strings — the shape returned by
 * `GET /api/professionals/:id/availability` (§10).
 */
export function getAvailableSlots(input: AvailabilityInput): string[] {
  return getDaySlots(input)
    .filter((slot) => slot.available)
    .map((slot) => slot.time);
}
