import { describe, expect, test } from "bun:test";

import { nextDueDate, renderTemplate } from "./template";

describe("renderTemplate", () => {
  test("replaces every occurrence of the known values, with or without spaces", () => {
    expect(renderTemplate("Hi {{tenant_name}}, {{ amount }} due. Bye {{tenant_name}}", { tenant_name: "Lucía", amount: "$800.00" }))
      .toBe("Hi Lucía, $800.00 due. Bye Lucía");
  });

  test("leaves variables without a value in place", () => {
    expect(renderTemplate("Due on {{due_date}} at {{property_name}}", { property_name: "Casa" })).toBe("Due on {{due_date}} at Casa");
  });

  test("does not treat $ in values as replacement patterns", () => {
    expect(renderTemplate("{{amount}}", { amount: "$&$1" })).toBe("$&$1");
  });
});

describe("nextDueDate", () => {
  test("this month when the day has not passed, including today", () => {
    expect(nextDueDate("2026-11-03", 5)).toBe("2026-11-05");
    expect(nextDueDate("2026-11-05", 5)).toBe("2026-11-05");
  });

  test("next month when the day has passed, across the year end", () => {
    expect(nextDueDate("2026-11-06", 5)).toBe("2026-12-05");
    expect(nextDueDate("2026-12-20", 5)).toBe("2027-01-05");
  });

  test("uses the last day of shorter months", () => {
    expect(nextDueDate("2026-04-02", 31)).toBe("2026-04-30");
    expect(nextDueDate("2026-01-31", 30)).toBe("2026-02-28");
    expect(nextDueDate("2028-02-01", 30)).toBe("2028-02-29");
  });
});
