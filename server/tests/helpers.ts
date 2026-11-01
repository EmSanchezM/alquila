import { eq } from "drizzle-orm";

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

export const TRUSTED_ORIGIN = "http://localhost:3000";

export async function request(method: string, path: string, body?: unknown, cookie?: string) {
  const res = await app.request(`/api${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      origin: TRUSTED_ORIGIN,
      ...(cookie ? { cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, json: (text ? JSON.parse(text) : null) as any };
}

/** Signs up a new user through better-auth and returns its id and session cookie. */
export async function signUp(tag: string) {
  const res = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json", origin: TRUSTED_ORIGIN },
    body: JSON.stringify({ name: "Test User", email: `${tag}@test.com`, password: "test-password-123", firstName: "Test", lastName: "User" }),
  });
  if (res.status !== 200) throw new Error(`sign-up failed: ${res.status} ${await res.text()}`);

  const json = (await res.json()) as { user: { id: string } };
  const cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  return { userId: json.user.id, cookie };
}

export type Fixtures = ReturnType<typeof createFixtures>;

/**
 * Signs up a user and seeds a property, renter and lease owned by it.
 * cleanup() removes every row owned by that user.
 */
export function createFixtures() {
  const tag = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const ids = {
    tag,
    propertyId: `p-${tag}`,
    renterId: `r-${tag}`,
    leaseId: `l-${tag}`,
  };
  const session = { userId: "", cookie: "" };
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
    Object.assign(session, await signUp(tag));
    const userId = session.userId;
    await db.insert(properties).values({ id: ids.propertyId, userId, name: "Fixture", address: "A", city: "C", country: "CR", propertyType: "house" });
    await db.insert(renters).values({ id: ids.renterId, userId, firstName: "Fixture", lastName: "Renter" });
    await db.insert(leases).values({ id: ids.leaseId, propertyId: ids.propertyId, renterId: ids.renterId, userId, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: "500" });
  }

  async function cleanup() {
    const userId = session.userId;
    if (!userId) return;
    await db.delete(documents).where(eq(documents.userId, userId));
    await db.delete(expenses).where(eq(expenses.userId, userId));
    await db.delete(payments).where(eq(payments.userId, userId));
    await db.delete(maintenanceRequests).where(eq(maintenanceRequests.userId, userId));
    await db.delete(leases).where(eq(leases.userId, userId));
    await db.delete(renters).where(eq(renters.userId, userId));
    await db.delete(properties).where(eq(properties.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }

  return {
    ...ids,
    created,
    get userId() {
      return session.userId;
    },
    get cookie() {
      return session.cookie;
    },
    /** Authenticated request as this fixture's user. */
    request: (method: string, path: string, body?: unknown) => request(method, path, body, session.cookie),
    seed,
    cleanup,
  };
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
  const { tag, propertyId, renterId, leaseId } = f;
  return [
    {
      name: "properties", path: "/properties", entity: "Property", field: "name",
      body: () => ({ name: `Prop ${tag}`, address: "Av 1", city: "SJ", state: "SJ", zipCode: "10101", country: "CR", propertyType: "house", bedrooms: 3, bathrooms: 2, squareMeters: 120, description: "test", amenities: [], images: [] }),
    },
    {
      name: "renters", path: "/renters", entity: "Renter", field: "lastName",
      body: () => ({ firstName: "Lucía", lastName: `Renter ${tag}`, email: "l@test.com", phoneNumber: "+50499990000", dniNumber: "0801", emergencyContact: { name: "M", phone: "1", relationship: "mother" }, verificationStatus: "pending", notes: "" }),
    },
    {
      name: "leases", path: "/leases", entity: "Lease", field: "terms",
      body: () => ({ propertyId, renterId, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: 800, securityDeposit: 800, paymentDueDay: 5, status: "pending", contractFile: "", terms: `Lease ${tag}`, autoRenew: false }),
    },
    {
      name: "maintenanceRequests", path: "/maintenance-requests", entity: "Maintenance request", field: "title",
      body: () => ({ propertyId, renterId, title: `Leak ${tag}`, description: "drips", category: "plumbing", priority: "high", status: "open", reportedDate: "2026-11-01T09:00:00Z", scheduledDate: "2026-11-03T09:00:00Z", completedDate: "2026-11-04T09:00:00Z", assignedTo: "Juan", estimatedCost: 100, actualCost: 0, photos: [], notes: "" }),
    },
    {
      name: "payments", path: "/payments", entity: "Payment", field: "reference",
      body: () => ({ leaseId, amount: 800, dueDate: "2026-12-05", paidDate: "2026-12-04", paymentMethod: "cash", status: "pending", reference: `Pay ${tag}`, receiptFile: "", notes: "", customFields: {} }),
    },
    {
      name: "expenses", path: "/expenses", entity: "Expense", field: "description",
      body: () => ({ propertyId, category: "repair", description: `Expense ${tag}`, amount: 60, expenseDate: "2026-11-02", receiptFile: "", vendor: "V", isRecurring: false, recurringFrequency: "", notes: "" }),
    },
    {
      name: "documents", path: "/documents", entity: "Document", field: "name",
      body: () => ({ propertyId, renterId, leaseId, name: `Doc ${tag}`, type: "lease", fileUrl: "http://x/c.pdf", fileSize: 1024, mimeType: "application/pdf", expirationDate: "2027-01-01", isImportant: true, tags: [] }),
    },
  ];
}
