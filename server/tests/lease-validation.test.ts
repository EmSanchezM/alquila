import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures } from "./helpers";

const f = createFixtures();
const { tag, propertyId, renterId } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const requiredOnly = () => ({ propertyId, renterId, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: 800 });
const fullBody = () => ({
  ...requiredOnly(), securityDeposit: 800, paymentDueDay: 5, status: "active", contractFile: "", terms: `Terms ${tag}`, autoRenew: true,
});

async function create(body: Record<string, unknown>) {
  const res = await f.request("POST", "/leases", body);
  if (res.status === 200) f.created.leases.push(res.json.data.id);
  return res;
}

describe("POST /leases accepts the nullable columns as optional", () => {
  test("required fields only; table defaults apply", async () => {
    const { status, json } = await create(requiredOnly());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      monthlyRent: "800.00", securityDeposit: null, paymentDueDay: 1, status: "active", contractFile: null, terms: null, autoRenew: false,
    });
  });

  test("a full body is still stored as before", async () => {
    const { status, json } = await create(fullBody());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: "800.00", securityDeposit: "800.00", paymentDueDay: 5, status: "active", terms: `Terms ${tag}`, autoRenew: true,
    });
  });

  test("pending is an accepted status", async () => {
    const { status, json } = await create({ ...fullBody(), status: "pending" });

    expect(status).toBe(200);
    expect(json.data.status).toBe("pending");
  });
});

describe("POST /leases rejects values the table cannot store with 400", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["startDate that is not a date", { startDate: "not-a-date" }],
    ["empty endDate", { endDate: "" }],
    ["impossible calendar date", { startDate: "2026-02-30" }],
    ["endDate before startDate", { startDate: "2026-06-01", endDate: "2026-05-31" }],
    ["negative monthlyRent", { monthlyRent: -1 }],
    ["monthlyRent above decimal(10,2)", { monthlyRent: 100_000_000 }],
    ["negative securityDeposit", { securityDeposit: -1 }],
    ["paymentDueDay 0", { paymentDueDay: 0 }],
    ["paymentDueDay 32", { paymentDueDay: 32 }],
    ["unknown status", { status: "open" }],
    ["contractFile over 500 characters", { contractFile: "x".repeat(501) }],
  ];

  for (const [label, override] of cases) {
    test(label, async () => {
      const { status, json } = await create({ ...fullBody(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("PUT /leases/:id", () => {
  test("rejects an unknown status with 400", async () => {
    const { status } = await f.request("PUT", `/leases/${f.leaseId}`, { status: "open" });

    expect(status).toBe(400);
  });

  test("rejects endDate before startDate when both are sent", async () => {
    const { status } = await f.request("PUT", `/leases/${f.leaseId}`, { startDate: "2026-06-01", endDate: "2026-05-01" });

    expect(status).toBe(400);
  });

  test("clears nullable columns with null and keeps the rest", async () => {
    const { json: created } = await create(fullBody());
    const { status, json } = await f.request("PUT", `/leases/${created.data.id}`, { securityDeposit: null, terms: null, status: "terminated" });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ securityDeposit: null, terms: null, status: "terminated", monthlyRent: "800.00", paymentDueDay: 5 });
  });
});

describe("GET /leases includes the property and renter names", () => {
  test("list and detail", async () => {
    const { json: created } = await create(fullBody());
    const id = created.data.id;

    const list = await f.request("GET", "/leases");
    const item = list.json.data.find((l: { id: string }) => l.id === id);
    expect(item).toMatchObject({ id, propertyId, renterId, propertyName: "Fixture", renterName: "Fixture Renter" });

    const one = await f.request("GET", `/leases/${id}`);
    expect(one.json.data).toMatchObject({ id, monthlyRent: "800.00", propertyName: "Fixture", renterName: "Fixture Renter" });
  });
});
