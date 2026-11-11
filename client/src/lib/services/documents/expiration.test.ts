import { describe, expect, test } from "bun:test";

import { expirationStatus } from "./expiration";

describe("expirationStatus", () => {
  const today = "2026-11-11";

  test("no date is no status", () => {
    expect(expirationStatus(null, today)).toBeNull();
  });

  test("a past date is expired; today is not", () => {
    expect(expirationStatus("2026-11-10", today)).toBe("expired");
    expect(expirationStatus("2026-11-11", today)).toBe("soon");
  });

  test("within 30 days is soon, inclusive; later is no status", () => {
    expect(expirationStatus("2026-12-11", today)).toBe("soon");
    expect(expirationStatus("2026-12-12", today)).toBeNull();
  });

  test("crosses month and year boundaries", () => {
    expect(expirationStatus("2027-01-10", "2026-12-15")).toBe("soon");
    expect(expirationStatus("2027-01-15", "2026-12-15")).toBeNull();
  });
});
