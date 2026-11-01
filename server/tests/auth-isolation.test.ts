import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";

import { db } from "@server/database";
import { properties } from "@server/database/schema";
import { createFixtures, moduleCases, request } from "./helpers";

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

const unauthorized = { success: false, message: "Unauthorized" };

describe("API requires a session", () => {
  for (const c of moduleCases(owner)) {
    test(`${c.path} without a session answers 401`, async () => {
      for (const [method, path, body] of [
        ["GET", c.path],
        ["GET", `${c.path}/any-id`],
        ["POST", c.path, c.body()],
        ["PUT", `${c.path}/any-id`, {}],
        ["DELETE", `${c.path}/any-id`],
      ] as const) {
        const res = await request(method, path, body);
        expect(res.status, `${method} ${path}`).toBe(401);
        expect(res.json).toEqual(unauthorized);
      }
    });
  }

  test("an invalid session cookie answers 401", async () => {
    const res = await request("GET", "/properties", undefined, "better-auth.session_token=forged");
    expect(res.status).toBe(401);
  });

  test("auth endpoints stay public", async () => {
    const res = await request("GET", "/auth/get-session");
    expect(res.status).toBe(200);
    expect(res.json).toBeNull();
  });
});

describe("userId comes from the session", () => {
  test("a userId in the body is ignored", async () => {
    const body = { ...moduleCases(owner)[0]!.body(), userId: other.userId };
    const { status, json } = await owner.request("POST", "/properties", body);

    expect(status).toBe(200);
    expect(json.data.userId).toBe(owner.userId);
  });
});

describe("users only see their own records", () => {
  for (const c of moduleCases(owner)) {
    test(c.name, async () => {
      const created = await owner.request("POST", c.path, c.body());
      expect(created.status).toBe(200);
      const id = created.json.data.id;
      const notFound = { success: false, message: `${c.entity} not found` };

      const list = await other.request("GET", c.path);
      expect(list.json.data.some((r: { id: string }) => r.id === id)).toBe(false);

      for (const [method, body] of [["GET"], ["PUT", { [c.field]: "hijacked" }], ["DELETE"]] as const) {
        const res = await other.request(method, `${c.path}/${id}`, body);
        expect(res.status, method).toBe(404);
        expect(res.json).toEqual(notFound);
      }

      const mine = await owner.request("GET", `${c.path}/${id}`);
      expect(mine.status).toBe(200);
      expect(mine.json.data[c.field]).toBe(created.json.data[c.field]);
    });
  }

  test("delete rule does not reveal another user's leases", async () => {
    const res = await other.request("DELETE", `/properties/${owner.propertyId}`);

    expect(res.status).toBe(404);
    const [row] = await db.select().from(properties).where(eq(properties.id, owner.propertyId));
    expect(row?.isActive).toBe(true);
  });
});
