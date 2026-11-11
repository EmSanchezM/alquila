import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures } from "./helpers";

const f = createFixtures();
const { tag, propertyId, renterId } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const requiredOnly = () => ({ propertyId, title: `Leak ${tag}`, description: "Kitchen sink drips", category: "plumbing" });
// Valid on the previous schema too, so the rejection cases below fail only for their own field.
const fullBody = () => ({
  ...requiredOnly(), renterId, priority: "high", status: "in_progress",
  reportedDate: "2026-11-01T09:00:00Z", scheduledDate: "2026-11-03T09:00:00Z", completedDate: "2026-11-04T09:00:00Z",
  assignedTo: "Juan", estimatedCost: 100.5, actualCost: 90, photos: [], notes: "ok",
});

async function create(body: Record<string, unknown>) {
  const res = await f.request("POST", "/maintenance-requests", body);
  if (res.status === 200) f.created.maintenanceRequests.push(res.json.data.id);
  return res;
}

describe("POST /maintenance-requests accepts the nullable columns as optional", () => {
  test("required fields only; table defaults apply", async () => {
    const { status, json } = await create(requiredOnly());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      renterId: null, priority: "medium", status: "open", scheduledDate: null, completedDate: null,
      assignedTo: null, estimatedCost: null, actualCost: null, photos: null, notes: null,
    });
    expect(json.data.reportedDate).toBeTruthy();
  });

  test("a full body is still stored as before", async () => {
    const { status, json } = await create(fullBody());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ renterId, priority: "high", status: "in_progress", assignedTo: "Juan", estimatedCost: "100.50", actualCost: "90.00", notes: "ok" });
    expect(new Date(json.data.scheduledDate).toISOString()).toBe("2026-11-03T09:00:00.000Z");
  });

  test("date-only values and appliances are accepted", async () => {
    const { status, json } = await create({ ...requiredOnly(), category: "appliances", scheduledDate: "2026-11-10" });

    expect(status).toBe(200);
    expect(json.data.category).toBe("appliances");
    expect(new Date(json.data.scheduledDate).toISOString()).toBe("2026-11-10T00:00:00.000Z");
  });
});

describe("POST /maintenance-requests rejects values the table cannot store with 400", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["title over 200 characters", { title: "x".repeat(201) }],
    ["unknown category", { category: "roof" }],
    ["unknown priority", { priority: "critical" }],
    ["unknown status", { status: "done" }],
    ["scheduledDate as a bare number", { scheduledDate: 0 }],
    ["scheduledDate that is not a date", { scheduledDate: "tomorrow" }],
    ["assignedTo over 100 characters", { assignedTo: "x".repeat(101) }],
    ["negative estimatedCost", { estimatedCost: -1 }],
    ["actualCost with more than 2 decimals", { actualCost: 10.555 }],
    ["actualCost above decimal(10,2)", { actualCost: 100_000_000 }],
  ];

  for (const [label, override] of cases) {
    test(label, async () => {
      const { status, json } = await create({ ...fullBody(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("PUT /maintenance-requests/:id", () => {
  test("rejects an unknown status with 400", async () => {
    const { json: created } = await create(fullBody());
    const { status } = await f.request("PUT", `/maintenance-requests/${created.data.id}`, { status: "done" });

    expect(status).toBe(400);
  });

  test("clears nullable columns with null and keeps the rest", async () => {
    const { json: created } = await create(fullBody());
    const { status, json } = await f.request("PUT", `/maintenance-requests/${created.data.id}`, { renterId: null, completedDate: null, actualCost: null, status: "open" });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ renterId: null, completedDate: null, actualCost: null, status: "open", assignedTo: "Juan", estimatedCost: "100.50" });
  });
});

describe("GET /maintenance-requests includes the property and renter names", () => {
  test("list and detail, with a null renter name when there is no renter", async () => {
    const { json: withRenter } = await create(fullBody());
    const { json: withoutRenter } = await create(requiredOnly());

    const list = await f.request("GET", "/maintenance-requests");
    const byId = (id: string) => list.json.data.find((m: { id: string }) => m.id === id);
    expect(byId(withRenter.data.id)).toMatchObject({ propertyName: "Fixture", renterName: "Fixture Renter" });
    expect(byId(withoutRenter.data.id)).toMatchObject({ propertyName: "Fixture", renterName: null });

    const one = await f.request("GET", `/maintenance-requests/${withRenter.data.id}`);
    expect(one.json.data).toMatchObject({ title: `Leak ${tag}`, propertyName: "Fixture", renterName: "Fixture Renter" });
  });
});
