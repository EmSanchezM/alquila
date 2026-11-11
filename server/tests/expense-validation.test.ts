import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures } from "./helpers";

const f = createFixtures();
const { tag, propertyId } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const requiredOnly = () => ({ category: "utilities", description: `Water ${tag}`, amount: 45.5, expenseDate: "2026-11-02" });
// Valid on the previous schema too, so the rejection cases below fail only for their own field.
const fullBody = () => ({
  ...requiredOnly(), propertyId, receiptFile: "", vendor: "AyA", isRecurring: true, recurringFrequency: "monthly", notes: "ok",
});

async function create(body: Record<string, unknown>) {
  const res = await f.request("POST", "/expenses", body);
  if (res.status === 200) f.created.expenses.push(res.json.data.id);
  return res;
}

describe("POST /expenses accepts the nullable columns as optional", () => {
  test("required fields only, without a property", async () => {
    const { status, json } = await create(requiredOnly());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      propertyId: null, amount: "45.50", expenseDate: "2026-11-02", receiptFile: null, vendor: null, isRecurring: false, recurringFrequency: null, notes: null,
    });
  });

  test("a full body is still stored as before", async () => {
    const { status, json } = await create(fullBody());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ propertyId, vendor: "AyA", isRecurring: true, recurringFrequency: "monthly", notes: "ok" });
  });

  test("an empty recurringFrequency on a one-off expense is stored as null, as before", async () => {
    const { status, json } = await create({ ...fullBody(), category: "repair", isRecurring: false, recurringFrequency: "" });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ category: "repair", isRecurring: false });
    expect(json.data.recurringFrequency ?? "").toBe("");
  });
});

describe("POST /expenses rejects values the table cannot store with 400", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["unknown category", { category: "food" }],
    ["description over 200 characters", { description: "x".repeat(201) }],
    ["zero amount", { amount: 0 }],
    ["amount with more than 2 decimals", { amount: 10.555 }],
    ["amount above decimal(10,2)", { amount: 100_000_000 }],
    ["expenseDate that is not a date", { expenseDate: "yesterday" }],
    ["vendor over 100 characters", { vendor: "x".repeat(101) }],
    ["receiptFile over 500 characters", { receiptFile: "x".repeat(501) }],
    ["unknown recurringFrequency", { recurringFrequency: "weekly" }],
    ["recurring without a frequency", { isRecurring: true, recurringFrequency: "" }],
  ];

  for (const [label, override] of cases) {
    test(label, async () => {
      const { status, json } = await create({ ...fullBody(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("PUT /expenses/:id", () => {
  test("rejects an unknown category with 400", async () => {
    const { json: created } = await create(fullBody());
    const { status } = await f.request("PUT", `/expenses/${created.data.id}`, { category: "food" });

    expect(status).toBe(400);
  });

  test("clears nullable columns with null and keeps the rest", async () => {
    const { json: created } = await create(fullBody());
    const { status, json } = await f.request("PUT", `/expenses/${created.data.id}`, { propertyId: null, vendor: null, isRecurring: false, recurringFrequency: null });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ propertyId: null, vendor: null, isRecurring: false, recurringFrequency: null, amount: "45.50", notes: "ok" });
  });
});

describe("GET /expenses includes the property name", () => {
  test("list and detail, with a null name when there is no property", async () => {
    const { json: withProperty } = await create(fullBody());
    const { json: withoutProperty } = await create(requiredOnly());

    const list = await f.request("GET", "/expenses");
    const byId = (id: string) => list.json.data.find((e: { id: string }) => e.id === id);
    expect(byId(withProperty.data.id)).toMatchObject({ propertyName: "Fixture" });
    expect(byId(withoutProperty.data.id)).toMatchObject({ propertyName: null });

    const one = await f.request("GET", `/expenses/${withProperty.data.id}`);
    expect(one.json.data).toMatchObject({ description: `Water ${tag}`, propertyName: "Fixture" });
  });
});
