import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures, request } from "./helpers";

const f = createFixtures();
const { tag, userId, propertyId, renterId, leaseId } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const cases: { name: keyof typeof f.created; path: string; body: () => Record<string, unknown>; field: string }[] = [
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
    name: "maintenanceRequests", path: "/maintenance-requests", field: "title",
    body: () => ({ propertyId, renterId, userId, title: `Leak ${tag}`, description: "drips", category: "plumbing", priority: "high", status: "open", reportedDate: "2026-11-01T09:00:00Z", scheduledDate: "2026-11-03T09:00:00Z", completedDate: "2026-11-04T09:00:00Z", assignedTo: "Juan", estimatedCost: 100, actualCost: 0, photos: [], notes: "" }),
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
      const { status, json } = await request("POST", c.path, body);

      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data?.id).toBe("string");
      expect(json.data[c.field]).toBe(body[c.field]);
      f.created[c.name].push(json.data.id);
    });
  }
});
