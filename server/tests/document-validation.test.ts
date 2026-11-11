import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures, signUp } from "./helpers";

const f = createFixtures();
const { tag, propertyId, renterId, leaseId } = f;
let stranger: { userId: string };

beforeAll(async () => {
  await f.seed();
  stranger = await signUp(`${tag}-doc-stranger`);
});
afterAll(f.cleanup);

const fileUrl = (userId = f.userId, ext = "pdf") => `/api/files/${userId}/019a0000-0000-7000-8000-000000000001.${ext}`;
const requiredOnly = () => ({ name: `Doc ${tag}`, type: "insurance", fileUrl: fileUrl() });
// Valid on the previous schema too, so the rejection cases below fail only for their own field.
const fullBody = () => ({
  ...requiredOnly(), propertyId, renterId, leaseId, fileSize: 2048, mimeType: "application/pdf", expirationDate: "2027-06-30", isImportant: true, tags: ["policy"],
});

async function create(body: Record<string, unknown>) {
  const res = await f.request("POST", "/documents", body);
  if (res.status === 200) f.created.documents.push(res.json.data.id);
  return res;
}

describe("POST /documents accepts the nullable columns as optional", () => {
  test("required fields only: a general document without links", async () => {
    const { status, json } = await create(requiredOnly());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      propertyId: null, renterId: null, leaseId: null, fileSize: null, mimeType: null, expirationDate: null, isImportant: false, tags: null,
    });
  });

  test("a full body is still stored as before", async () => {
    const { status, json } = await create(fullBody());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ propertyId, renterId, leaseId, type: "insurance", fileUrl: fileUrl(), fileSize: 2048, expirationDate: "2027-06-30", isImportant: true, tags: ["policy"] });
  });
});

describe("POST /documents rejects invalid values with 400", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["name over 200 characters", { name: "x".repeat(201) }],
    ["unknown type", { type: "lease" }],
    ["fileUrl outside the file storage", { fileUrl: "http://x/c.pdf" }],
    ["fileUrl of another user's file", { fileUrl: "STRANGER" }],
    ["fileUrl that is not an upload key", { fileUrl: `/api/files/${"USER"}/../x.pdf` }],
    ["negative fileSize", { fileSize: -1 }],
    ["mimeType over 100 characters", { mimeType: "x".repeat(101) }],
    ["expirationDate that is not a date", { expirationDate: "soon" }],
    ["tag over 50 characters", { tags: ["x".repeat(51)] }],
  ];

  for (const [label, override] of cases) {
    test(label, async () => {
      const body = { ...fullBody(), ...override };
      if (body.fileUrl === "STRANGER") body.fileUrl = fileUrl(stranger.userId);
      if (typeof body.fileUrl === "string") body.fileUrl = body.fileUrl.replace("USER", f.userId);
      const { status, json } = await create(body);

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("PUT /documents/:id", () => {
  test("rejects another user's fileUrl with 400", async () => {
    const { json: created } = await create(fullBody());
    const { status } = await f.request("PUT", `/documents/${created.data.id}`, { fileUrl: fileUrl(stranger.userId) });

    expect(status).toBe(400);
  });

  test("clears links and nullable columns with null and keeps the rest", async () => {
    const { json: created } = await create(fullBody());
    const { status, json } = await f.request("PUT", `/documents/${created.data.id}`, { propertyId: null, leaseId: null, expirationDate: null, tags: null });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ propertyId: null, leaseId: null, expirationDate: null, tags: null, renterId, name: `Doc ${tag}`, isImportant: true });
  });
});

describe("GET /documents includes the names of what it is linked to", () => {
  test("list and detail; null names without links", async () => {
    const { json: linked } = await create(fullBody());
    const { json: general } = await create(requiredOnly());

    const list = await f.request("GET", "/documents");
    const byId = (id: string) => list.json.data.find((d: { id: string }) => d.id === id);
    expect(byId(linked.data.id)).toMatchObject({ propertyName: "Fixture", renterName: "Fixture Renter", leaseName: "Fixture · Fixture Renter" });
    expect(byId(general.data.id)).toMatchObject({ propertyName: null, renterName: null, leaseName: null });

    const one = await f.request("GET", `/documents/${linked.data.id}`);
    expect(one.json.data).toMatchObject({ name: `Doc ${tag}`, propertyName: "Fixture", leaseName: "Fixture · Fixture Renter" });
  });
});
