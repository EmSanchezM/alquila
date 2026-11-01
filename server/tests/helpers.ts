import { eq, inArray } from "drizzle-orm";

import app from "@server/app";
import { db } from "@server/database";
import {
  documents,
  expenses,
  leases,
  maintenanceRequests,
  payments,
  properties,
  renters,
  users,
} from "@server/database/schema";

// Integration helpers: require DATABASE_URL pointing at a migrated Postgres.

export async function request(method: string, path: string, body?: unknown) {
  const res = await app.request(`/api${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as any };
}

export type Fixtures = ReturnType<typeof createFixtures>;

/**
 * Seeds a user, property, renter and lease directly in the database and
 * tracks every row created through the API so cleanup() can remove them.
 */
export function createFixtures() {
  const tag = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const ids = {
    tag,
    userId: `u-${tag}`,
    propertyId: `p-${tag}`,
    renterId: `r-${tag}`,
    leaseId: `l-${tag}`,
  };
  const created = {
    documents: [] as string[],
    expenses: [] as string[],
    payments: [] as string[],
    maintenanceRequests: [] as string[],
    leases: [] as string[],
    renters: [] as string[],
    properties: [] as string[],
  };

  async function seed() {
    await db.insert(users).values({ id: ids.userId, email: `${tag}@test.com`, password: "x", firstName: "Test", lastName: "User" });
    await db.insert(properties).values({ id: ids.propertyId, userId: ids.userId, name: "Fixture", address: "A", city: "C", country: "CR", propertyType: "house" });
    await db.insert(renters).values({ id: ids.renterId, userId: ids.userId, firstName: "Fixture", lastName: "Renter" });
    await db.insert(leases).values({ id: ids.leaseId, propertyId: ids.propertyId, renterId: ids.renterId, userId: ids.userId, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: "500" });
  }

  async function cleanup() {
    if (created.documents.length) await db.delete(documents).where(inArray(documents.id, created.documents));
    if (created.expenses.length) await db.delete(expenses).where(inArray(expenses.id, created.expenses));
    if (created.payments.length) await db.delete(payments).where(inArray(payments.id, created.payments));
    if (created.maintenanceRequests.length) await db.delete(maintenanceRequests).where(inArray(maintenanceRequests.id, created.maintenanceRequests));
    await db.delete(leases).where(inArray(leases.id, [ids.leaseId, ...created.leases]));
    await db.delete(renters).where(inArray(renters.id, [ids.renterId, ...created.renters]));
    await db.delete(properties).where(inArray(properties.id, [ids.propertyId, ...created.properties]));
    await db.delete(users).where(eq(users.id, ids.userId));
  }

  return { ...ids, created, seed, cleanup };
}
