"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import {
  addDaysToDateKey,
  BOOKING_WINDOW_DAYS,
  dayOfWeek,
  todayInTimezone,
} from "@/lib/availability";

export interface BookingCalendarProps {
  /** 0–6 (Sun–Sat): the professional's working days. */
  workingDays: readonly number[];
  /** Selected day as "YYYY-MM-DD", or `null`. */
  selectedDate: string | null;
  /** Called with a bookable day as "YYYY-MM-DD". */
  onSelect: (date: string) => void;
  /** Professional's IANA timezone; decides what "today" is. */
  timezone?: string;
  className?: string;
}

const WEEKDAYS = [
  { short: "Su", long: "Sunday" },
  { short: "Mo", long: "Monday" },
  { short: "Tu", long: "Tuesday" },
  { short: "We", long: "Wednesday" },
  { short: "Th", long: "Thursday" },
  { short: "Fr", long: "Friday" },
  { short: "Sa", long: "Saturday" },
];

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const dayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "YYYY-MM" of a date key. */
const monthOf = (date: string) => date.slice(0, 7);
const dateKeyToUtc = (date: string) => new Date(`${date}T00:00:00Z`);

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** The days of a month as date keys, padded with `null` so the first day sits under its weekday. */
function monthGrid(month: string): (string | null)[][] {
  const first = `${month}-01`;
  const cells: (string | null)[] = Array(dayOfWeek(first)).fill(null);
  for (let day = first; monthOf(day) === month; day = addDaysToDateKey(day, 1)) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const noopSubscribe = () => () => {};

/**
 * Today's date in the timezone. Read on the client only (the server snapshot is
 * `null`), so prerendering never bakes in a stale "today".
 */
function useToday(timezone: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => todayInTimezone(timezone, new Date()),
    () => null,
  );
}

/**
 * Month date picker for booking (SPECIFICATION.md §11.2, US4).
 * Past days, non-working days, and days more than 60 days ahead are disabled.
 *
 * Keyboard: Arrow keys move by day/week, Home/End go to the start/end of the week,
 * PageUp/PageDown change month, Enter/Space select.
 */
export function BookingCalendar({
  workingDays,
  selectedDate,
  onSelect,
  timezone = "Africa/Nairobi",
  className = "",
}: BookingCalendarProps) {
  const today = useToday(timezone);
  const [visibleMonth, setVisibleMonth] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  if (!today) {
    return (
      <div
        aria-hidden="true"
        className={`h-80 w-full max-w-sm animate-pulse rounded-xl bg-slate-200 ${className}`}
      />
    );
  }

  const lastDay = addDaysToDateKey(today, BOOKING_WINDOW_DAYS);
  const firstMonth = monthOf(today);
  const lastMonth = monthOf(lastDay);
  const month = visibleMonth ?? monthOf(selectedDate ?? today);

  const clampToWindow = (date: string) =>
    date < today ? today : date > lastDay ? lastDay : date;

  // The single day that is reachable with Tab (roving tabindex).
  const activeDate =
    focusedDate && monthOf(focusedDate) === month
      ? focusedDate
      : selectedDate && monthOf(selectedDate) === month
        ? selectedDate
        : month === firstMonth
          ? today
          : `${month}-01`;

  // Same rule as isBookableDate (§6.1 rule 1), expressed against the `today` snapshot.
  const isEnabled = (date: string) =>
    date >= today && date <= lastDay && workingDays.includes(dayOfWeek(date));

  function moveFocus(date: string) {
    const target = clampToWindow(date);
    setFocusedDate(target);
    setVisibleMonth(monthOf(target));
    // Wait for the re-render, then move DOM focus to the new day.
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`button[data-date="${target}"]`)
        ?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDaysToDateKey(date, -1),
      ArrowRight: () => addDaysToDateKey(date, 1),
      ArrowUp: () => addDaysToDateKey(date, -7),
      ArrowDown: () => addDaysToDateKey(date, 7),
      Home: () => addDaysToDateKey(date, -dayOfWeek(date)),
      End: () => addDaysToDateKey(date, 6 - dayOfWeek(date)),
      PageUp: () => addDaysToDateKey(date, -30),
      PageDown: () => addDaysToDateKey(date, 30),
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      moveFocus(move());
    }
  }

  const monthLabel = monthFormatter.format(dateKeyToUtc(`${month}-01`));
  const canGoBack = month > firstMonth;
  const canGoForward = month < lastMonth;

  return (
    <div
      className={`w-full max-w-sm rounded-xl border border-slate-200 bg-card p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setVisibleMonth(shiftMonth(month, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <h3 id={`calendar-${month}`} aria-live="polite" className="text-base font-semibold text-ink">
          {monthLabel}
        </h3>
        <button
          type="button"
          onClick={() => setVisibleMonth(shiftMonth(month, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <table ref={gridRef} role="grid" aria-labelledby={`calendar-${month}`} className="w-full">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th
                key={d.short}
                scope="col"
                abbr={d.long}
                className="pb-2 text-center text-xs font-medium text-muted"
              >
                {d.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                if (!date) return <td key={j} />;
                const enabled = isEnabled(date);
                const selected = date === selectedDate;
                const isToday = date === today;
                return (
                  <td key={date} className="p-0.5 text-center">
                    <button
                      type="button"
                      data-date={date}
                      tabIndex={date === activeDate ? 0 : -1}
                      aria-disabled={!enabled}
                      aria-pressed={selected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={`${dayLabelFormatter.format(dateKeyToUtc(date))}${
                        enabled ? "" : ", unavailable"
                      }`}
                      onClick={() => {
                        setFocusedDate(date);
                        if (enabled) onSelect(date);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, date)}
                      className={[
                        "relative h-10 w-10 rounded-lg text-sm font-medium transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        selected
                          ? "bg-brand text-white"
                          : enabled
                            ? "text-ink hover:bg-slate-100"
                            : "cursor-not-allowed text-slate-400 line-through",
                        isToday && !selected ? "ring-1 ring-brand ring-inset" : "",
                      ].join(" ")}
                    >
                      {Number(date.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
