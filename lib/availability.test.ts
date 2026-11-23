import { describe, expect, it } from "vitest";
import {
  addDaysToDateKey,
  BOOKING_WINDOW_DAYS,
  dayOfWeek,
  getAvailableSlots,
  getDaySlots,
  isBookableDate,
  parseDateKey,
  rangesOverlap,
  slotToDate,
  todayInTimezone,
  type AvailabilityInput,
} from "./availability";

const TZ = "Africa/Nairobi"; // UTC+3, no daylight saving time

// Thursday 2026-11-19, 15:00 in Nairobi.
const NOW = new Date("2026-11-19T12:00:00Z");
const MONDAY = "2026-11-23";
const SATURDAY = "2026-11-21";

/** Builds an instant from a Nairobi wall-clock time. */
const nairobi = (date: string, time: string) => new Date(`${date}T${time}:00+03:00`);

function input(overrides: Partial<AvailabilityInput> = {}): AvailabilityInput {
  return {
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: "09:00",
    workingHoursEnd: "12:00",
    timezone: TZ,
    durationMinutes: 60,
    date: MONDAY,
    appointments: [],
    now: NOW,
    ...overrides,
  };
}

describe("date helpers", () => {
  it("parses valid date keys and rejects impossible ones", () => {
    expect(parseDateKey("2026-11-23")).toEqual({ year: 2026, month: 11, day: 23 });
    expect(parseDateKey("2026-02-30")).toBeNull();
    expect(parseDateKey("23/11/2026")).toBeNull();
  });

  it("computes the day of week", () => {
    expect(dayOfWeek(MONDAY)).toBe(1);
    expect(dayOfWeek(SATURDAY)).toBe(6);
  });

  it("adds days across month and year boundaries", () => {
    expect(addDaysToDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToDateKey("2026-11-19", 60)).toBe("2027-01-18");
  });

  it("uses the professional's timezone for 'today'", () => {
    // 22:30 UTC on the 19th is already 01:30 on the 20th in Nairobi.
    expect(todayInTimezone(TZ, new Date("2026-11-19T22:30:00Z"))).toBe("2026-11-20");
    expect(todayInTimezone("UTC", new Date("2026-11-19T22:30:00Z"))).toBe("2026-11-19");
  });

  it("converts a wall-clock slot to a UTC instant", () => {
    expect(slotToDate(MONDAY, "09:30", TZ).toISOString()).toBe("2026-11-23T06:30:00.000Z");
  });
});

describe("rangesOverlap", () => {
  const a = { startTime: nairobi(MONDAY, "09:00"), endTime: nairobi(MONDAY, "10:00") };

  it("detects overlapping ranges", () => {
    const b = { startTime: nairobi(MONDAY, "09:30"), endTime: nairobi(MONDAY, "10:30") };
    expect(rangesOverlap(a, b)).toBe(true);
  });

  it("treats back-to-back ranges as not overlapping", () => {
    const b = { startTime: nairobi(MONDAY, "10:00"), endTime: nairobi(MONDAY, "11:00") };
    expect(rangesOverlap(a, b)).toBe(false);
  });
});

describe("getAvailableSlots", () => {
  it("returns every slot of a free working day", () => {
    expect(getAvailableSlots(input())).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("returns no slots on a non-working day", () => {
    expect(getAvailableSlots(input({ date: SATURDAY }))).toEqual([]);
  });

  it("returns no slots on a fully booked day", () => {
    const appointments = [
      { startTime: nairobi(MONDAY, "09:00"), endTime: nairobi(MONDAY, "12:00"), status: "CONFIRMED" },
    ];
    expect(getAvailableSlots(input({ appointments }))).toEqual([]);
    // The slots still exist, they are just unavailable.
    expect(getDaySlots(input({ appointments })).every((s) => !s.available)).toBe(true);
  });

  it("drops a slot that would end after closing time", () => {
    // 09:00–10:30 fits, 10:30–12:00 fits; nothing else would end by 12:00.
    expect(getAvailableSlots(input({ durationMinutes: 90 }))).toEqual(["09:00", "10:30"]);
    // 45-minute slots: 09:00, 09:45, 10:30 (ends 11:15); 11:15 would end at 12:00 — still OK.
    expect(getAvailableSlots(input({ durationMinutes: 45 }))).toEqual([
      "09:00",
      "09:45",
      "10:30",
      "11:15",
    ]);
    // With closing at 11:50, the 11:15 slot would end at 12:00 and is dropped.
    expect(
      getAvailableSlots(input({ durationMinutes: 45, workingHoursEnd: "11:50" })),
    ).toEqual(["09:00", "09:45", "10:30"]);
  });

  it("hides slots that overlap a PENDING or CONFIRMED appointment", () => {
    const appointments = [
      // 09:30–10:30 overlaps both the 09:00 and 10:00 slots.
      { startTime: nairobi(MONDAY, "09:30"), endTime: nairobi(MONDAY, "10:30"), status: "PENDING" },
    ];
    expect(getAvailableSlots(input({ appointments }))).toEqual(["11:00"]);
  });

  it("ignores CANCELLED and COMPLETED appointments", () => {
    const appointments = [
      { startTime: nairobi(MONDAY, "09:00"), endTime: nairobi(MONDAY, "10:00"), status: "CANCELLED" },
      { startTime: nairobi(MONDAY, "10:00"), endTime: nairobi(MONDAY, "11:00"), status: "COMPLETED" },
    ];
    expect(getAvailableSlots(input({ appointments }))).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("keeps a slot that starts exactly when an appointment ends", () => {
    const appointments = [
      { startTime: nairobi(MONDAY, "09:00"), endTime: nairobi(MONDAY, "10:00"), status: "CONFIRMED" },
    ];
    expect(getAvailableSlots(input({ appointments }))).toEqual(["10:00", "11:00"]);
  });

  it("hides today's slots that have already started", () => {
    const today = "2026-11-19"; // Thursday; it is 15:00 in Nairobi
    const slots = getAvailableSlots(
      input({ date: today, workingHoursStart: "13:00", workingHoursEnd: "18:00" }),
    );
    // 13:00 and 14:00 have passed; 15:00 starts exactly now, so it is hidden too.
    expect(slots).toEqual(["16:00", "17:00"]);
  });

  it("returns no slots for a past date", () => {
    expect(getAvailableSlots(input({ date: "2026-11-16" }))).toEqual([]);
  });

  it(`allows dates up to ${BOOKING_WINDOW_DAYS} days ahead and no further`, () => {
    const lastDay = addDaysToDateKey("2026-11-19", BOOKING_WINDOW_DAYS); // 2027-01-18, a Monday
    const tooFar = addDaysToDateKey(lastDay, 1);
    const allDays = [0, 1, 2, 3, 4, 5, 6];

    expect(getAvailableSlots(input({ date: lastDay, workingDays: allDays }))).toHaveLength(3);
    expect(getAvailableSlots(input({ date: tooFar, workingDays: allDays }))).toEqual([]);
  });

  it("returns no slots for invalid working hours or input", () => {
    expect(getAvailableSlots(input({ workingHoursEnd: "09:00" }))).toEqual([]);
    expect(getAvailableSlots(input({ workingHoursStart: "9am" }))).toEqual([]);
    expect(getAvailableSlots(input({ durationMinutes: 0 }))).toEqual([]);
    expect(getAvailableSlots(input({ date: "not-a-date" }))).toEqual([]);
  });
});

describe("isBookableDate", () => {
  const workdays = [1, 2, 3, 4, 5];

  it("accepts today and working days within the window", () => {
    expect(isBookableDate("2026-11-19", workdays, TZ, NOW)).toBe(true);
    expect(isBookableDate(MONDAY, workdays, TZ, NOW)).toBe(true);
  });

  it("rejects past, non-working, and out-of-window days", () => {
    expect(isBookableDate("2026-11-18", workdays, TZ, NOW)).toBe(false);
    expect(isBookableDate(SATURDAY, workdays, TZ, NOW)).toBe(false);
    expect(isBookableDate("2027-01-19", workdays, TZ, NOW)).toBe(false);
  });
});
