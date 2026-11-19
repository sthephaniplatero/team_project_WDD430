"use client";

import { useRef, useState } from "react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { getDaySlots, slotToDate, type TimeSlot } from "@/lib/availability";
import { formatMoney, type Currency } from "@/lib/money";

// Sample data standing in for a professional profile and their services (§9).
const PROFESSIONAL = {
  workingDays: [1, 2, 3, 4, 5],
  workingHoursStart: "09:00",
  workingHoursEnd: "17:00",
  timezone: "Africa/Nairobi",
};

const SERVICES: { id: string; title: string; durationMinutes: number; price: number; currency: Currency }[] = [
  { id: "s1", title: "Math tutoring", durationMinutes: 60, price: 2500, currency: "USD" },
  { id: "s2", title: "Quick consultation", durationMinutes: 30, price: 150000, currency: "KES" },
  { id: "s3", title: "Exam prep workshop", durationMinutes: 90, price: 4000, currency: "USD" },
];

/** Pretend these are already booked on whatever day is picked. */
function sampleAppointments(date: string) {
  const tz = PROFESSIONAL.timezone;
  return [
    { startTime: slotToDate(date, "10:00", tz), endTime: slotToDate(date, "11:00", tz), status: "CONFIRMED" },
    { startTime: slotToDate(date, "14:00", tz), endTime: slotToDate(date, "14:30", tz), status: "PENDING" },
    { startTime: slotToDate(date, "15:00", tz), endTime: slotToDate(date, "16:00", tz), status: "CANCELLED" },
  ];
}

const FAKE_LATENCY_MS = 500;

export function BookingDemo() {
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const request = useRef(0);

  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];

  function loadSlots(nextDate: string, durationMinutes: number) {
    const id = ++request.current;
    setDate(nextDate);
    setTime(null);
    setLoading(true);
    // Simulates the availability API so the loading skeleton is visible.
    setTimeout(() => {
      if (id !== request.current) return;
      setSlots(
        getDaySlots({
          ...PROFESSIONAL,
          durationMinutes,
          date: nextDate,
          appointments: sampleAppointments(nextDate),
          now: new Date(),
        }),
      );
      setLoading(false);
    }, FAKE_LATENCY_MS);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
      <section aria-labelledby="pick-date" className="flex flex-col gap-4">
        <div>
          <label htmlFor="service" className="mb-1 block text-sm font-medium text-ink">
            Service
          </label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => {
              const next = SERVICES.find((s) => s.id === e.target.value) ?? SERVICES[0];
              setServiceId(next.id);
              if (date) loadSlots(date, next.durationMinutes);
            }}
            className="w-full max-w-sm rounded-lg border border-slate-300 bg-card px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand"
          >
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} · {s.durationMinutes} min · {formatMoney(s.price, s.currency)}
              </option>
            ))}
          </select>
        </div>
        <h2 id="pick-date" className="text-lg font-semibold text-ink">
          1. Pick a date
        </h2>
        <BookingCalendar
          workingDays={PROFESSIONAL.workingDays}
          selectedDate={date}
          onSelect={(d) => loadSlots(d, service.durationMinutes)}
          timezone={PROFESSIONAL.timezone}
        />
      </section>

      <section aria-labelledby="pick-time" className="flex flex-col gap-4">
        <h2 id="pick-time" className="text-lg font-semibold text-ink">
          2. Pick a time
        </h2>
        {date ? (
          <TimeSlotPicker
            slots={slots}
            loading={loading}
            selected={time}
            onSelect={setTime}
            timezone={PROFESSIONAL.timezone}
          />
        ) : (
          <p className="text-sm text-muted">Choose a date to see available times.</p>
        )}

        <div className="rounded-xl border border-slate-200 bg-card p-5 text-sm text-ink">
          <h3 className="mb-2 font-semibold">Debug</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted">Service</dt>
            <dd>
              {service.title} ({service.durationMinutes} min,{" "}
              {formatMoney(service.price, service.currency)})
            </dd>
            <dt className="text-muted">Date</dt>
            <dd>{date ?? "—"}</dd>
            <dt className="text-muted">Time</dt>
            <dd>{time ?? "—"}</dd>
            <dt className="text-muted">startTime (UTC)</dt>
            <dd className="font-mono">
              {date && time ? slotToDate(date, time, PROFESSIONAL.timezone).toISOString() : "—"}
            </dd>
          </dl>
          <p className="mt-3 text-xs text-muted">
            Sample bookings on every day: 10:00–11:00 CONFIRMED, 14:00–14:30 PENDING (both block),
            15:00–16:00 CANCELLED (does not block).
          </p>
        </div>
      </section>
    </div>
  );
}
