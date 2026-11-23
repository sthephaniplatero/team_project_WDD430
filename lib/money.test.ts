import { describe, expect, it } from "vitest";
import { formatMoney, fromMinorUnits, toMinorUnits } from "./money";

describe("toMinorUnits", () => {
  it("converts decimal amounts to integer minor units", () => {
    expect(toMinorUnits("25")).toBe(2500);
    expect(toMinorUnits("25.5")).toBe(2550);
    expect(toMinorUnits(25.99)).toBe(2599);
    expect(toMinorUnits("1500", "KES")).toBe(150000);
    expect(toMinorUnits("0")).toBe(0);
  });

  it("avoids floating-point rounding errors", () => {
    // 19.99 * 100 === 1998.9999999999998 in JavaScript
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(toMinorUnits("0.29")).toBe(29);
  });

  it("rejects negative, non-numeric, and too-precise amounts", () => {
    expect(() => toMinorUnits("-5")).toThrow(RangeError);
    expect(() => toMinorUnits("abc")).toThrow(RangeError);
    expect(() => toMinorUnits("1.234")).toThrow(RangeError);
    expect(() => toMinorUnits("")).toThrow(RangeError);
  });
});

describe("fromMinorUnits", () => {
  it("converts minor units back to a decimal amount", () => {
    expect(fromMinorUnits(2500)).toBe(25);
    expect(fromMinorUnits(2599, "USD")).toBe(25.99);
  });
});

describe("formatMoney", () => {
  it("formats USD", () => {
    expect(formatMoney(2500, "USD")).toBe("$25.00");
    expect(formatMoney(123456, "USD")).toBe("$1,234.56");
  });

  it("formats KES", () => {
    // Intl may use a non-breaking space between the code and the number.
    expect(formatMoney(150000, "KES").replace(/\s/g, " ")).toBe("KES 1,500.00");
  });
});
