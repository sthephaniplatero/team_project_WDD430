"use client";

import type { TimeSlot } from "@/lib/availability";

export interface TimeSlotPickerProps {
  /**
   * "HH:mm" strings (as returned by the availability API) or `{ time, available }`
   * objects (from `getDaySlots`) when unavailable slots should also be shown.
   */
  slots: ReadonlyArray<string | TimeSlot>;
  /** Shows a skeleton while slots are being fetched. */
  loading?: boolean;
  /** Selected slot ("HH:mm"), or `null`. */
  selected: string | null;
  onSelect: (time: string) => void;
  /** Professional's timezone label shown under the slots, e.g. "Africa/Nairobi". */
  timezone?: string;
  className?: string;
}

const SKELETON_COUNT = 8;

const toSlot = (slot: string | TimeSlot): TimeSlot =>
  typeof slot === "string" ? { time: slot, available: true } : slot;

/**
 * Grid of toggle buttons for picking a time (SPECIFICATION.md §8.5, US4).
 * States: available, selected, unavailable; plus loading and empty states.
 */
export function TimeSlotPicker({
  slots,
  loading = false,
  selected,
  onSelect,
  timezone,
  className = "",
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className={className} aria-busy="true">
        <span className="sr-only" role="status">
          Loading available times…
        </span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const normalized = slots.map(toSlot);

  if (!normalized.some((slot) => slot.available)) {
    return (
      <div
        role="status"
        className={`rounded-xl border border-dashed border-slate-300 bg-card p-6 text-center ${className}`}
      >
        <p className="text-sm font-semibold text-ink">No times available on this day</p>
        <p className="mt-1 text-sm text-muted">Please pick another date.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div role="group" aria-label="Available times" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {normalized.map(({ time, available }) => {
          const isSelected = available && time === selected;
          return (
            <button
              key={time}
              type="button"
              disabled={!available}
              aria-pressed={isSelected}
              aria-label={available ? time : `${time}, unavailable`}
              onClick={() => onSelect(time)}
              className={[
                "h-11 rounded-xl border text-sm font-medium tabular-nums transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                isSelected
                  ? "border-brand bg-brand text-white"
                  : available
                    ? "border-slate-200 bg-card text-ink hover:border-brand hover:text-brand"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through",
              ].join(" ")}
            >
              {time}
            </button>
          );
        })}
      </div>
      {timezone && (
        <p className="mt-3 text-xs font-medium tracking-[0.01em] text-muted">
          Times shown in {timezone}
        </p>
      )}
    </div>
  );
}
