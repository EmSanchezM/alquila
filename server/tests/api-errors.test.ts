import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import app from "@server/app";
import { createFixtures, request } from "./helpers";

const f = createFixtures();

beforeAll(f.seed);
afterAll(f.cleanup);

const modules = [
  { path: "/properties", entity: "Property" },
  { path: "/renters", entity: "Renter" },
  { path: "/leases", entity: "Lease" },
  { path: "/expenses", entity: "Expense" },
  { path: "/maintenance-requests", entity: "Maintenance request" },
  { path: "/documents", entity: "Document" },
  { path: "/payments", entity: "Payment" },
];

describe("missing records answer 404", () => {
  for (const m of modules) {
    test(`GET ${m.path}/:id`, async () => {
      const { status, json } = await request("GET", `${m.path}/does-not-exist`);

      expect(status).toBe(404);
      expect(json).toEqual({ success: false, message: `${m.entity} not found` });
    });

    test(`PUT ${m.path}/:id`, async () => {
      const { status, json } = await request("PUT", `${m.path}/does-not-exist`, {});

      expect(status).toBe(404);
      expect(json).toEqual({ success: false, message: `${m.entity} not found` });
    });
  }
});

describe("unexpected errors answer 500 without internals", () => {
  test("database failure does not leak SQL", async () => {
    const { status, json } = await request("POST", "/leases", {
      propertyId: "missing-property", renterId: f.renterId, userId: f.userId,
      startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: 800, securityDeposit: 800,
      paymentDueDay: 5, status: "pending", contractFile: "", terms: "", autoRenew: false,
    });

    expect(status).toBe(500);
    expect(json).toEqual({ success: false, message: "Internal server error" });
  });
});

describe("client errors keep answering 400", () => {
  test("malformed JSON", async () => {
    const res = await app.request("/api/properties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });

    expect(res.status).toBe(400);
  });

  test("schema validation failure", async () => {
    const { status, json } = await request("POST", "/properties", { name: 1 });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });
});
