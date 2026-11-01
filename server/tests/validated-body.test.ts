import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures, request } from "./helpers";

const f = createFixtures();
const { tag, userId, propertyId, renterId, leaseId } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const documentBody = () => ({ propertyId, userId, renterId, leaseId, name: `Doc ${tag}`, type: "lease", fileUrl: "http://x/c.pdf", fileSize: 1024, mimeType: "application/pdf", expirationDate: "2027-01-01", isImportant: true, tags: [] });
const paymentBody = () => ({ leaseId, userId, amount: 800, dueDate: "2026-12-05", paidDate: "2026-12-04", paymentMethod: "cash", status: "pending", reference: `Pay ${tag}`, receiptFile: "", notes: "" });
const maintenanceBody = () => ({ propertyId, renterId, userId, title: `Leak ${tag}`, description: "drips", category: "plumbing", priority: "high", status: "open", reportedDate: "2026-11-01T09:00:00Z", scheduledDate: "2026-11-03T09:00:00Z", completedDate: "2026-11-04T09:00:00Z", assignedTo: "Juan", estimatedCost: 100.5, actualCost: 0, photos: [], notes: "" });

describe("POST persists only validated data", () => {
  test("fields outside the create schema are ignored", async () => {
    const { status, json } = await request("POST", "/documents", { ...documentBody(), isActive: false });

    expect(status).toBe(200);
    f.created.documents.push(json.data.id);
    expect(json.data.isActive).toBe(true);
  });

  test("maintenance timestamps and decimals are persisted", async () => {
    const { status, json } = await request("POST", "/maintenance-requests", maintenanceBody());

    expect(status).toBe(200);
    f.created.maintenanceRequests.push(json.data.id);
    expect(new Date(json.data.scheduledDate).toISOString()).toBe("2026-11-03T09:00:00.000Z");
    expect(Number(json.data.estimatedCost)).toBe(100.5);
  });

  test("invalid body is still rejected without leaking SQL", async () => {
    const { status, json } = await request("POST", "/maintenance-requests", { ...maintenanceBody(), scheduledDate: "not-a-date" });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
    expect(JSON.stringify(json)).not.toContain("Failed query");
  });
});

describe("payments customFields", () => {
  test("POST keeps the provided keys", async () => {
    const { status, json } = await request("POST", "/payments", { ...paymentBody(), customFields: { bank: "BAC" } });

    expect(status).toBe(200);
    f.created.payments.push(json.data.id);
    expect(json.data.customFields).toEqual({ bank: "BAC" });
  });

  test("PUT keeps the provided keys", async () => {
    const created = await request("POST", "/payments", { ...paymentBody(), customFields: {} });
    f.created.payments.push(created.json.data.id);

    const { status, json } = await request("PUT", `/payments/${created.json.data.id}`, { customFields: { bank: "BAC", ref: "123" } });

    expect(status).toBe(200);
    expect(json.data.customFields).toEqual({ bank: "BAC", ref: "123" });
  });

  test("PUT still rejects a non-object customFields", async () => {
    const created = await request("POST", "/payments", { ...paymentBody(), customFields: {} });
    f.created.payments.push(created.json.data.id);

    const { status } = await request("PUT", `/payments/${created.json.data.id}`, { customFields: "nope" });

    expect(status).toBe(400);
  });
});
