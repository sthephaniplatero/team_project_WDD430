import type { Metadata } from "next";
import { BookingDemo } from "./BookingDemo";

// TEMPORARY (issue #15): preview page for BookingCalendar and TimeSlotPicker.
// Remove in Week 06 once the real booking flow ships on /professionals/[id] (#21).

export const metadata: Metadata = {
  title: "Booking components (dev)",
  robots: { index: false, follow: false },
};

export default function DevBookingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl bg-surface p-6 sm:p-10">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.02em] text-ink">Booking components</h1>
      <p className="mb-8 text-sm text-muted">
        Dev preview for issue #15 — sample data only, nothing is saved.
      </p>
      <BookingDemo />
    </main>
  );
}
