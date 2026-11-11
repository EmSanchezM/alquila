import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures } from "./helpers";

const f = createFixtures();
const { tag, leaseId } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const requiredOnly = () => ({ leaseId, amount: 800, dueDate: "2026-12-05" });
// Valid on the previous schema too, so the rejection cases below fail only for their own field.
const fullBody = () => ({
  ...requiredOnly(), paidDate: "2026-12-04", paymentMethod: "transfer", status: "paid", reference: `Ref ${tag}`, receiptFile: "", notes: "ok", customFields: { gateway: "x" },
});

async function create(body: Record<string, unknown>) {
  const res = await f.request("POST", "/payments", body);
  if (res.status === 200) f.created.payments.push(res.json.data.id);
  return res;
}

describe("POST /payments accepts the nullable columns as optional", () => {
  test("required fields only; status defaults to pending", async () => {
    const { status, json } = await create(requiredOnly());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      amount: "800.00", dueDate: "2026-12-05", paidDate: null, paymentMethod: null, status: "pending", reference: null, receiptFile: null, notes: null, customFields: null,
    });
  });

  test("a full body is still stored as before", async () => {
    const { status, json } = await create(fullBody());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      amount: "800.00", paidDate: "2026-12-04", paymentMethod: "transfer", status: "paid", reference: `Ref ${tag}`, notes: "ok", customFields: { gateway: "x" },
    });
  });

  test("card and partial are accepted", async () => {
    const { status, json } = await create({ ...fullBody(), paymentMethod: "card", status: "partial" });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ paymentMethod: "card", status: "partial" });
  });
});

describe("POST /payments rejects values the table cannot store with 400", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["zero amount", { amount: 0 }],
    ["negative amount", { amount: -5 }],
    ["amount above decimal(10,2)", { amount: 100_000_000 }],
    ["amount below one cent (Postgres would store 0.00)", { amount: 0.001 }],
    ["amount with more than 2 decimals", { amount: 10.555 }],
    ["dueDate that is not a date", { dueDate: "soon" }],
    ["empty paidDate", { paidDate: "" }],
    ["impossible paidDate", { paidDate: "2026-02-30" }],
    ["unknown paymentMethod", { paymentMethod: "bitcoin" }],
    ["unknown status", { status: "late" }],
    ["reference over 100 characters", { reference: "x".repeat(101) }],
    ["receiptFile over 500 characters", { receiptFile: "x".repeat(501) }],
  ];

  for (const [label, override] of cases) {
    test(label, async () => {
      const { status, json } = await create({ ...fullBody(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("PUT /payments/:id", () => {
  test("rejects an unknown status with 400", async () => {
    const { json: created } = await create(fullBody());
    const { status } = await f.request("PUT", `/payments/${created.data.id}`, { status: "late" });

    expect(status).toBe(400);
  });

  test("clears nullable columns with null and keeps the rest", async () => {
    const { json: created } = await create(fullBody());
    const { status, json } = await f.request("PUT", `/payments/${created.data.id}`, { paidDate: null, paymentMethod: null, status: "pending" });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ paidDate: null, paymentMethod: null, status: "pending", amount: "800.00", reference: `Ref ${tag}` });
  });
});

describe("GET /payments includes the property and renter names of the lease", () => {
  test("list and detail", async () => {
    const { json: created } = await create(fullBody());
    const id = created.data.id;

    const list = await f.request("GET", "/payments");
    const item = list.json.data.find((p: { id: string }) => p.id === id);
    expect(item).toMatchObject({ id, leaseId, propertyName: "Fixture", renterName: "Fixture Renter" });

    const one = await f.request("GET", `/payments/${id}`);
    expect(one.json.data).toMatchObject({ id, amount: "800.00", propertyName: "Fixture", renterName: "Fixture Renter" });
  });
});
