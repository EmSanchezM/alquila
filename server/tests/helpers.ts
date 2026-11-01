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
    await db.insert(users).values({ id: ids.userId, email: `${tag}@test.com`, password: "x", name: "Test User", firstName: "Test", lastName: "User" });
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

export type ModuleCase = {
  name: keyof Fixtures["created"];
  path: string;
  entity: string;
  field: string;
  body: () => Record<string, unknown>;
};

/** One valid create payload per API module, wired to the given fixtures. */
export function moduleCases(f: Fixtures): ModuleCase[] {
  const { tag, userId, propertyId, renterId, leaseId } = f;
  return [
    {
      name: "properties", path: "/properties", entity: "Property", field: "name",
      body: () => ({ userId, name: `Prop ${tag}`, address: "Av 1", city: "SJ", state: "SJ", zipCode: "10101", country: "CR", propertyType: "house", bedrooms: 3, bathrooms: 2, squareMeters: 120, description: "test", amenities: [], images: [] }),
    },
    {
      name: "renters", path: "/renters", entity: "Renter", field: "lastName",
      body: () => ({ userId, firstName: "Lucía", lastName: `Renter ${tag}`, email: "l@test.com", phoneNumber: "+50499990000", dniNumber: "0801", emergencyContact: { name: "M", phone: "1", relationship: "mother" }, verificationStatus: "pending", notes: "" }),
    },
    {
      name: "leases", path: "/leases", entity: "Lease", field: "terms",
      body: () => ({ propertyId, renterId, userId, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: 800, securityDeposit: 800, paymentDueDay: 5, status: "pending", contractFile: "", terms: `Lease ${tag}`, autoRenew: false }),
    },
    {
      name: "maintenanceRequests", path: "/maintenance-requests", entity: "Maintenance request", field: "title",
      body: () => ({ propertyId, renterId, userId, title: `Leak ${tag}`, description: "drips", category: "plumbing", priority: "high", status: "open", reportedDate: "2026-11-01T09:00:00Z", scheduledDate: "2026-11-03T09:00:00Z", completedDate: "2026-11-04T09:00:00Z", assignedTo: "Juan", estimatedCost: 100, actualCost: 0, photos: [], notes: "" }),
    },
    {
      name: "payments", path: "/payments", entity: "Payment", field: "reference",
      body: () => ({ leaseId, userId, amount: 800, dueDate: "2026-12-05", paidDate: "2026-12-04", paymentMethod: "cash", status: "pending", reference: `Pay ${tag}`, receiptFile: "", notes: "", customFields: {} }),
    },
    {
      name: "expenses", path: "/expenses", entity: "Expense", field: "description",
      body: () => ({ propertyId, userId, category: "repair", description: `Expense ${tag}`, amount: 60, expenseDate: "2026-11-02", receiptFile: "", vendor: "V", isRecurring: false, recurringFrequency: "", notes: "" }),
    },
    {
      name: "documents", path: "/documents", entity: "Document", field: "name",
      body: () => ({ propertyId, userId, renterId, leaseId, name: `Doc ${tag}`, type: "lease", fileUrl: "http://x/c.pdf", fileSize: 1024, mimeType: "application/pdf", expirationDate: "2027-01-01", isImportant: true, tags: [] }),
    },
  ];
}
