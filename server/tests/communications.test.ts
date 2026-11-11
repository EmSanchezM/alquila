import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";

import app from "@server/app";
import { db } from "@server/database";
import { communications } from "@server/database/schema";
import { createFixtures, signUp, request, TRUSTED_ORIGIN } from "./helpers";

const f = createFixtures();
const { tag, propertyId, renterId } = f;
let stranger: { userId: string, cookie: string };

beforeAll(async () => {
  await f.seed();
  stranger = await signUp(`${tag}-comm-stranger`);
});
afterAll(async () => {
  // Communications have no soft delete; remove this file's rows before the fixtures they reference.
  await db.delete(communications).where(eq(communications.userId, f.userId));
  await db.delete(communications).where(eq(communications.userId, stranger.userId));
  await f.cleanup();
});

const minimal = () => ({ type: "call", direction: "outbound", message: `Called about rent ${tag}` });

describe("POST /communications", () => {
  test("requires a session", async () => {
    const res = await app.request("/api/communications", { method: "POST", headers: { "content-type": "application/json", origin: TRUSTED_ORIGIN }, body: JSON.stringify(minimal()) });

    expect(res.status).toBe(401);
  });

  test("logs a minimal communication with table defaults", async () => {
    const before = Date.now();
    const { status, json } = await f.request("POST", "/communications", minimal());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ type: "call", direction: "outbound", message: `Called about rent ${tag}`, status: "sent", subject: null, renterId: null, propertyId: null });
    expect(new Date(json.data.sentAt).getTime()).toBeGreaterThanOrEqual(before - 5_000);
  });

  test("logs a communication linked to a renter and a property, at a given date", async () => {
    const { status, json } = await f.request("POST", "/communications", {
      type: "email", direction: "inbound", renterId, propertyId, subject: "Question", message: "Can I paint the walls?", status: "read", sentAt: "2026-11-01T15:30:00Z",
    });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ renterId, propertyId, subject: "Question", status: "read" });
    expect(new Date(json.data.sentAt).toISOString()).toBe("2026-11-01T15:30:00.000Z");
  });

  test("answers 404 for another user's renter or property", async () => {
    const otherRenter = await request("POST", "/renters", { firstName: "B", lastName: "B" }, stranger.cookie);

    const res = await f.request("POST", "/communications", { ...minimal(), renterId: otherRenter.json.data.id });
    expect(res.status).toBe(404);
    expect(res.json).toEqual({ success: false, message: "Renter not found" });
  });

  const invalid: [string, Record<string, unknown>][] = [
    ["unknown type", { type: "fax" }],
    ["unknown direction", { direction: "sideways" }],
    ["empty message", { message: "" }],
    ["subject over 200 characters", { subject: "x".repeat(201) }],
    ["unknown status", { status: "bounced" }],
    ["sentAt that is not a date", { sentAt: "yesterday" }],
  ];
  for (const [label, override] of invalid) {
    test(`rejects ${label} with 400`, async () => {
      const { status, json } = await f.request("POST", "/communications", { ...minimal(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("GET /communications", () => {
  test("lists only the user's communications, newest first, with renter and property names", async () => {
    await f.request("POST", "/communications", { ...minimal(), renterId, propertyId, sentAt: "2026-10-01T10:00:00Z", message: `Old ${tag}` });
    await f.request("POST", "/communications", { ...minimal(), renterId, sentAt: "2026-11-05T10:00:00Z", message: `New ${tag}` });
    await request("POST", "/communications", { ...minimal(), message: `Foreign ${tag}` }, stranger.cookie);

    const { status, json } = await f.request("GET", "/communications");
    const mine = (json.data as { message: string }[]).filter((c) => c.message === `Old ${tag}` || c.message === `New ${tag}`);

    expect(status).toBe(200);
    expect(mine.map((c) => c.message)).toEqual([`New ${tag}`, `Old ${tag}`]);
    expect(mine[1]).toMatchObject({ renterName: "Fixture Renter", propertyName: "Fixture" });
    expect(mine[0]).toMatchObject({ renterName: "Fixture Renter", propertyName: null });
    expect((json.data as { message: string }[]).some((c) => c.message === `Foreign ${tag}`)).toBe(false);
  });

  test("detail answers 404 for another user's communication", async () => {
    const foreign = await request("POST", "/communications", minimal(), stranger.cookie);
    const { status } = await f.request("GET", `/communications/${foreign.json.data.id}`);

    expect(status).toBe(404);
  });

  test("the log is append-only: no update or delete", async () => {
    const { json } = await f.request("POST", "/communications", minimal());

    // No such routes: Hono's plain 404, like any unknown API route.
    for (const method of ["PUT", "DELETE"]) {
      const res = await app.request(`/api/communications/${json.data.id}`, { method, headers: { "content-type": "application/json", origin: TRUSTED_ORIGIN, cookie: f.cookie }, body: method === "PUT" ? JSON.stringify({ message: "changed" }) : undefined });
      expect(res.status).toBe(404);
    }
    const { json: unchanged } = await f.request("GET", `/communications/${json.data.id}`);
    expect(unchanged.data.message).toBe(`Called about rent ${tag}`);
  });
});
