import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";

import app from "@server/app";
import { DrizzleRentersRepository } from "@server/modules/renters/infrastructure/repositories/DrizzleRentersRepository";
import { createFixtures } from "./helpers";

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
      const { status, json } = await f.request("GET", `${m.path}/does-not-exist`);

      expect(status).toBe(404);
      expect(json).toEqual({ success: false, message: `${m.entity} not found` });
    });

    test(`PUT ${m.path}/:id`, async () => {
      const { status, json } = await f.request("PUT", `${m.path}/does-not-exist`, {});

      expect(status).toBe(404);
      expect(json).toEqual({ success: false, message: `${m.entity} not found` });
    });
  }
});

describe("unexpected errors answer 500 without internals", () => {
  test("database failure does not leak SQL", async () => {
    // Every body is validated before Postgres, so simulate the driver failing instead.
    const failure = spyOn(DrizzleRentersRepository.prototype, "findAll").mockRejectedValue(
      new Error('Failed query: select "password" from "users"'),
    );
    const silenced = spyOn(console, "error").mockImplementation(() => {});

    try {
      const { status, json } = await f.request("GET", "/renters");

      expect(status).toBe(500);
      expect(json).toEqual({ success: false, message: "Internal server error" });
    } finally {
      failure.mockRestore();
      silenced.mockRestore();
    }
  });
});

describe("client errors keep answering 400", () => {
  test("malformed JSON", async () => {
    const res = await app.request("/api/properties", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: f.cookie },
      body: "{not json",
    });

    expect(res.status).toBe(400);
  });

  test("schema validation failure", async () => {
    const { status, json } = await f.request("POST", "/properties", { name: 1 });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });
});
