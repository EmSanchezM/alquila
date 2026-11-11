import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures } from "./helpers";

const f = createFixtures();
const { tag } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const requiredOnly = () => ({ firstName: "Lucía", lastName: `Min ${tag}` });
const fullBody = () => ({
  ...requiredOnly(), email: "l@test.com", phoneNumber: "+50499990000", dniNumber: "0801",
  emergencyContact: { name: "M", phone: "1", relationship: "mother" }, verificationStatus: "verified", notes: "ok",
});

async function create(body: Record<string, unknown>) {
  const res = await f.request("POST", "/renters", body);
  if (res.status === 200) f.created.renters.push(res.json.data.id);
  return res;
}

describe("POST /renters accepts the nullable columns as optional", () => {
  test("required fields only; verification defaults to pending", async () => {
    const { status, json } = await create(requiredOnly());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      lastName: `Min ${tag}`, email: null, phoneNumber: null, dniNumber: null, emergencyContact: null, verificationStatus: "pending", notes: null,
    });
  });

  test("nullable columns sent as null", async () => {
    const { status, json } = await create({
      ...requiredOnly(), email: null, phoneNumber: null, dniNumber: null, emergencyContact: null, notes: null,
    });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ email: null, phoneNumber: null, dniNumber: null, emergencyContact: null, notes: null });
  });

  test("a full body is still stored as before", async () => {
    const { status, json } = await create(fullBody());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      email: "l@test.com", phoneNumber: "+50499990000", dniNumber: "0801",
      emergencyContact: { name: "M", phone: "1", relationship: "mother" }, verificationStatus: "verified", notes: "ok",
    });
  });
});

describe("POST /renters rejects values the table cannot store with 400", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["firstName over 100 characters", { firstName: "x".repeat(101) }],
    ["lastName over 100 characters", { lastName: "x".repeat(101) }],
    ["email over 255 characters", { email: `${"x".repeat(250)}@t.com` }],
    ["email without a valid format", { email: "not-an-email" }],
    ["phoneNumber over 20 characters", { phoneNumber: "1".repeat(21) }],
    ["dniNumber over 50 characters", { dniNumber: "1".repeat(51) }],
    ["unknown verificationStatus", { verificationStatus: "approved" }],
  ];

  for (const [label, override] of cases) {
    test(label, async () => {
      const { status, json } = await create({ ...fullBody(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("PUT /renters/:id", () => {
  test("rejects a firstName over 100 characters with 400", async () => {
    const { status } = await f.request("PUT", `/renters/${f.renterId}`, { firstName: "x".repeat(101) });

    expect(status).toBe(400);
  });

  test("clears nullable columns with null and keeps the rest", async () => {
    const { json: created } = await create(fullBody());
    const { status, json } = await f.request("PUT", `/renters/${created.data.id}`, { email: null, emergencyContact: null });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ email: null, emergencyContact: null, phoneNumber: "+50499990000", lastName: `Min ${tag}` });
  });
});
