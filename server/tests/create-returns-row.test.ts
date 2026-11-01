import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq, inArray } from "drizzle-orm";

import app from "@server/app";
import { db } from "@server/database";
import {
  documents,
  expenses,
  leases,
  payments,
  properties,
  renters,
  users,
} from "@server/database/schema";

// Integration test: requires DATABASE_URL pointing at a migrated Postgres.
const tag = `test-${Date.now()}`;
const userId = `u-${tag}`;
const propertyId = `p-${tag}`;
const renterId = `r-${tag}`;
const leaseId = `l-${tag}`;

const created: Record<string, string[]> = {
  documents: [], expenses: [], payments: [], leases: [], renters: [], properties: [],
};

beforeAll(async () => {
  await db.insert(users).values({ id: userId, email: `${tag}@test.com`, password: "x", firstName: "Test", lastName: "User" });
  await db.insert(properties).values({ id: propertyId, userId, name: "Fixture", address: "A", city: "C", country: "CR", propertyType: "house" });
  await db.insert(renters).values({ id: renterId, userId, firstName: "Fixture", lastName: "Renter" });
  await db.insert(leases).values({ id: leaseId, propertyId, renterId, userId, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: "500" });
});

afterAll(async () => {
  if (created.documents.length) await db.delete(documents).where(inArray(documents.id, created.documents));
  if (created.expenses.length) await db.delete(expenses).where(inArray(expenses.id, created.expenses));
  if (created.payments.length) await db.delete(payments).where(inArray(payments.id, created.payments));
  await db.delete(leases).where(inArray(leases.id, [leaseId, ...created.leases]));
  await db.delete(renters).where(inArray(renters.id, [renterId, ...created.renters]));
  await db.delete(properties).where(inArray(properties.id, [propertyId, ...created.properties]));
  await db.delete(users).where(eq(users.id, userId));
});

async function post(path: string, body: unknown) {
  const res = await app.request(`/api${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as any };
}

const cases: { name: keyof typeof created; path: string; body: () => Record<string, unknown>; field: string }[] = [
  {
    name: "properties", path: "/properties", field: "name",
    body: () => ({ userId, name: `Prop ${tag}`, address: "Av 1", city: "SJ", state: "SJ", zipCode: "10101", country: "CR", propertyType: "house", bedrooms: 3, bathrooms: 2, squareMeters: 120, description: "test", amenities: [], images: [] }),
  },
  {
    name: "renters", path: "/renters", field: "lastName",
    body: () => ({ userId, firstName: "Lucía", lastName: `Renter ${tag}`, email: "l@test.com", phoneNumber: "+50499990000", dniNumber: "0801", emergencyContact: { name: "M", phone: "1", relationship: "mother" }, verificationStatus: "pending", notes: "" }),
  },
  {
    name: "leases", path: "/leases", field: "terms",
    body: () => ({ propertyId, renterId, userId, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: 800, securityDeposit: 800, paymentDueDay: 5, status: "pending", contractFile: "", terms: `Lease ${tag}`, autoRenew: false }),
  },
  {
    name: "payments", path: "/payments", field: "reference",
    body: () => ({ leaseId, userId, amount: 800, dueDate: "2026-12-05", paidDate: "2026-12-04", paymentMethod: "cash", status: "pending", reference: `Pay ${tag}`, receiptFile: "", notes: "", customFields: {} }),
  },
  {
    name: "expenses", path: "/expenses", field: "description",
    body: () => ({ propertyId, userId, category: "repair", description: `Expense ${tag}`, amount: 60, expenseDate: "2026-11-02", receiptFile: "", vendor: "V", isRecurring: false, recurringFrequency: "", notes: "" }),
  },
  {
    name: "documents", path: "/documents", field: "name",
    body: () => ({ propertyId, userId, renterId, leaseId, name: `Doc ${tag}`, type: "lease", fileUrl: "http://x/c.pdf", fileSize: 1024, mimeType: "application/pdf", expirationDate: "2027-01-01", isImportant: true, tags: [] }),
  },
];

describe("POST create returns the persisted row", () => {
  for (const c of cases) {
    test(c.name, async () => {
      const body = c.body();
      const { status, json } = await post(c.path, body);

      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data?.id).toBe("string");
      expect(json.data[c.field]).toBe(body[c.field]);
      created[c.name].push(json.data.id);
    });
  }

  // Blocked by issue 02: the create schema sends timestamps as strings.
  test.todo("maintenance-requests");
});
