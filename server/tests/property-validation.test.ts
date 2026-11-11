import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures } from "./helpers";

const f = createFixtures();
const { tag } = f;

beforeAll(f.seed);
afterAll(f.cleanup);

const requiredOnly = () => ({ name: `Min ${tag}`, address: "Av 1", city: "SJ", country: "CR", propertyType: "house" });
const fullBody = () => ({ ...requiredOnly(), state: "SJ", zipCode: "10101", bedrooms: 3, bathrooms: 2, squareMeters: 120.5, description: "test", amenities: ["pool"], images: [] });

async function create(body: Record<string, unknown>) {
  const res = await f.request("POST", "/properties", body);
  if (res.status === 200) f.created.properties.push(res.json.data.id);
  return res;
}

describe("POST /properties accepts the nullable columns as optional", () => {
  test("required fields only", async () => {
    const { status, json } = await create(requiredOnly());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      name: `Min ${tag}`, state: null, zipCode: null, bedrooms: null, bathrooms: null, squareMeters: null, description: null,
    });
  });

  test("nullable columns sent as null", async () => {
    const { status, json } = await create({
      ...requiredOnly(), state: null, zipCode: null, bedrooms: null, bathrooms: null, squareMeters: null, description: null,
    });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ state: null, zipCode: null, bedrooms: null, squareMeters: null, description: null });
  });

  test("a full body is still stored as before", async () => {
    const { status, json } = await create(fullBody());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ state: "SJ", zipCode: "10101", bedrooms: 3, bathrooms: 2, squareMeters: "120.50", description: "test", amenities: ["pool"] });
  });
});

describe("POST /properties rejects values the table cannot store with 400", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["name over 200 characters", { name: "x".repeat(201) }],
    ["city over 100 characters", { city: "x".repeat(101) }],
    ["zipCode over 20 characters", { zipCode: "1".repeat(21) }],
    ["propertyType over 50 characters", { propertyType: "x".repeat(51) }],
    ["negative bedrooms", { bedrooms: -1 }],
    ["fractional bathrooms", { bathrooms: 1.5 }],
    ["negative squareMeters", { squareMeters: -10 }],
    ["squareMeters above decimal(8,2)", { squareMeters: 1_000_000 }],
  ];

  for (const [label, override] of cases) {
    test(label, async () => {
      const { status, json } = await create({ ...fullBody(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("PUT /properties/:id", () => {
  test("rejects a name over 200 characters with 400", async () => {
    const { status } = await f.request("PUT", `/properties/${f.propertyId}`, { name: "x".repeat(201) });

    expect(status).toBe(400);
  });

  test("clears a nullable column with null", async () => {
    const { json: created } = await create({ ...requiredOnly(), state: "SJ", bedrooms: 2 });
    const { status, json } = await f.request("PUT", `/properties/${created.data.id}`, { state: null, bedrooms: null });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ state: null, bedrooms: null, name: `Min ${tag}` });
  });
});
