import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures, moduleCases, type ModuleCase } from "./helpers";

const owner = createFixtures();
const other = createFixtures();

beforeAll(async () => {
  await owner.seed();
  await other.seed();
});
afterAll(async () => {
  await owner.cleanup();
  await other.cleanup();
});

const references = {
  propertyId: { entity: "Property", ownerId: () => owner.propertyId },
  renterId: { entity: "Renter", ownerId: () => owner.renterId },
  leaseId: { entity: "Lease", ownerId: () => owner.leaseId },
} as const;
type Reference = keyof typeof references;

const createRefs: Partial<Record<ModuleCase["name"], Reference[]>> = {
  leases: ["propertyId", "renterId"],
  maintenanceRequests: ["propertyId", "renterId"],
  payments: ["leaseId"],
  expenses: ["propertyId"],
  documents: ["propertyId", "renterId", "leaseId"],
};
const updateRefs: Partial<Record<ModuleCase["name"], Reference[]>> = {
  maintenanceRequests: ["propertyId", "renterId"],
  payments: ["leaseId"],
  expenses: ["propertyId"],
  documents: ["propertyId", "renterId", "leaseId"],
};

const cases = moduleCases(other);

describe("create rejects references to another user's records", () => {
  for (const c of cases) {
    for (const ref of createRefs[c.name] ?? []) {
      test(`${c.name}.${ref}`, async () => {
        const { entity, ownerId } = references[ref];
        const before = await other.request("GET", c.path);

        const { status, json } = await other.request("POST", c.path, { ...c.body(), [ref]: ownerId() });

        expect(status).toBe(404);
        expect(json).toEqual({ success: false, message: `${entity} not found` });
        const after = await other.request("GET", c.path);
        expect(after.json.data).toHaveLength(before.json.data.length);
      });
    }
  }
});

describe("update rejects references to another user's records", () => {
  for (const c of cases) {
    for (const ref of updateRefs[c.name] ?? []) {
      test(`${c.name}.${ref}`, async () => {
        const { entity, ownerId } = references[ref];
        const created = await other.request("POST", c.path, c.body());
        expect(created.status).toBe(200);
        const id = created.json.data.id;

        const { status, json } = await other.request("PUT", `${c.path}/${id}`, { [ref]: ownerId() });

        expect(status).toBe(404);
        expect(json).toEqual({ success: false, message: `${entity} not found` });
        const unchanged = await other.request("GET", `${c.path}/${id}`);
        expect(unchanged.json.data[ref]).toBe(created.json.data[ref]);
      });
    }
  }
});

describe("own references are accepted", () => {
  test("a lease on the user's own property and renter", async () => {
    const lease = cases.find((c) => c.name === "leases")!;
    const { status, json } = await other.request("POST", lease.path, lease.body());

    expect(status).toBe(200);
    expect(json.data.propertyId).toBe(other.propertyId);
    expect(json.data.renterId).toBe(other.renterId);
  });
});
