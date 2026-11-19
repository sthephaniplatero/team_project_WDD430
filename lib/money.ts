/**
 * Money helpers — SPECIFICATION.md §7.2.
 *
 * Prices are stored as integers in the minor unit (cents): 2500 = 25.00.
 * Forms accept decimals and convert them with `toMinorUnits`; the UI formats
 * stored values with `formatMoney`.
 */

export type Currency = "USD" | "KES";

/** Number of decimal places of each currency's minor unit (ISO 4217). */
const MINOR_UNIT_DIGITS: Record<Currency, number> = {
  USD: 2,
  KES: 2,
};

const DEFAULT_LOCALE = "en-US";

/**
 * Converts a decimal amount typed by a user ("25", "25.5", 25.99) to minor units.
 * Throws a RangeError for negative, non-numeric, or too-precise values (e.g. "1.234").
 */
export function toMinorUnits(amount: number | string, currency: Currency = "USD"): number {
  const text = typeof amount === "number" ? String(amount) : amount.trim();
  const digits = MINOR_UNIT_DIGITS[currency];
  const pattern = new RegExp(`^\\d+(\\.\\d{0,${digits}})?$`);
  if (!pattern.test(text)) {
    throw new RangeError(`Invalid ${currency} amount: ${String(amount)}`);
  }
  const [whole, fraction = ""] = text.split(".");
  // String arithmetic avoids floating-point errors such as 19.99 * 100 = 1998.9999…
  return Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, "0") || "0");
}

/** Converts stored minor units back to a decimal number (2500 → 25). */
export function fromMinorUnits(minor: number, currency: Currency = "USD"): number {
  return minor / 10 ** MINOR_UNIT_DIGITS[currency];
}

/** Formats stored minor units for display: formatMoney(2500, "USD") → "$25.00". */
export function formatMoney(
  minor: number,
  currency: Currency,
  locale: string = DEFAULT_LOCALE,
): string {
  const digits = MINOR_UNIT_DIGITS[currency];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fromMinorUnits(minor, currency));
}
