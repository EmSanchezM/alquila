import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";

import { db } from "@server/database";
import { properties, renters } from "@server/database/schema";
import { createFixtures, moduleCases, request } from "./helpers";

const f = createFixtures();

beforeAll(f.seed);
afterAll(f.cleanup);

async function create(c: ReturnType<typeof moduleCases>[number]) {
  const { json } = await request("POST", c.path, c.body());
  f.created[c.name].push(json.data.id);
  return json.data.id as string;
}

describe("DELETE hides the record everywhere", () => {
  for (const c of moduleCases(f)) {
    test(c.name, async () => {
      const id = await create(c);

      const del = await request("DELETE", `${c.path}/${id}`);
      expect(del.status).toBe(200);

      const list = await request("GET", c.path);
      expect(list.json.data.some((r: { id: string }) => r.id === id)).toBe(false);

      const notFound = { success: false, message: `${c.entity} not found` };
      const one = await request("GET", `${c.path}/${id}`);
      expect(one.status).toBe(404);
      expect(one.json).toEqual(notFound);

      const put = await request("PUT", `${c.path}/${id}`, {});
      expect(put.status).toBe(404);
      expect(put.json).toEqual(notFound);

      const again = await request("DELETE", `${c.path}/${id}`);
      expect(again.status).toBe(404);
      expect(again.json).toEqual(notFound);
    });
  }
});

describe("DELETE on a missing id answers 404", () => {
  for (const c of moduleCases(f)) {
    test(c.name, async () => {
      const { status, json } = await request("DELETE", `${c.path}/does-not-exist`);

      expect(status).toBe(404);
      expect(json).toEqual({ success: false, message: `${c.entity} not found` });
    });
  }
});

describe("DELETE keeps the row in the database", () => {
  test("renters are soft deleted", async () => {
    const id = await create(moduleCases(f).find((c) => c.name === "renters")!);

    await request("DELETE", `/renters/${id}`);

    const [row] = await db.select().from(renters).where(eq(renters.id, id));
    expect(row?.isActive).toBe(false);
  });
});

describe("records with active leases cannot be deleted", () => {
  test("property: 409 while a lease is active, 200 once it is deleted", async () => {
    const blocked = await request("DELETE", `/properties/${f.propertyId}`);
    expect(blocked.status).toBe(409);
    expect(blocked.json).toEqual({ success: false, message: "Property has active leases" });

    const list = await request("GET", "/properties");
    expect(list.json.data.some((r: { id: string }) => r.id === f.propertyId)).toBe(true);

    const extraLease = await request("POST", "/leases", moduleCases(f).find((c) => c.name === "leases")!.body());
    f.created.leases.push(extraLease.json.data.id);
    await request("DELETE", `/leases/${f.leaseId}`);
    await request("DELETE", `/leases/${extraLease.json.data.id}`);

    const allowed = await request("DELETE", `/properties/${f.propertyId}`);
    expect(allowed.status).toBe(200);
  });

  test("renter: 409 while a lease is active", async () => {
    const renterCase = moduleCases(f).find((c) => c.name === "renters")!;
    const renterId = await create(renterCase);
    const leaseCase = moduleCases(f).find((c) => c.name === "leases")!;
    const lease = await request("POST", "/leases", { ...leaseCase.body(), renterId });
    f.created.leases.push(lease.json.data.id);

    const blocked = await request("DELETE", `/renters/${renterId}`);
    expect(blocked.status).toBe(409);
    expect(blocked.json).toEqual({ success: false, message: "Renter has active leases" });

    await request("DELETE", `/leases/${lease.json.data.id}`);
    const allowed = await request("DELETE", `/renters/${renterId}`);
    expect(allowed.status).toBe(200);
  });

  test("PUT cannot deactivate a property", async () => {
    const id = await create(moduleCases(f).find((c) => c.name === "properties")!);

    const { status } = await request("PUT", `/properties/${id}`, { isActive: false });
    expect(status).toBe(200);

    const [row] = await db.select().from(properties).where(eq(properties.id, id));
    expect(row?.isActive).toBe(true);
  });
});
