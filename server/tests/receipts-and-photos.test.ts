import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures, signUp } from "./helpers";

const f = createFixtures();
const { tag, propertyId, leaseId } = f;
let stranger: { userId: string };

beforeAll(async () => {
  await f.seed();
  stranger = await signUp(`${tag}-rcpt-stranger`);
});
afterAll(f.cleanup);

const upload = (n: number, ext: string, userId = f.userId) => `/api/files/${userId}/019a0000-0000-7000-8000-${String(n).padStart(12, "0")}.${ext}`;

const modules = [
  { path: "/payments", created: "payments" as const, body: () => ({ leaseId, amount: 800, dueDate: "2026-12-05" }) },
  { path: "/expenses", created: "expenses" as const, body: () => ({ category: "utilities", description: `Water ${tag}`, amount: 45, expenseDate: "2026-11-02" }) },
];

async function create(path: string, created: "payments" | "expenses" | "maintenanceRequests", body: Record<string, unknown>) {
  const res = await f.request("POST", path, body);
  if (res.status === 200) f.created[created].push(res.json.data.id);
  return res;
}

for (const m of modules) {
  describe(`${m.path} receiptFile`, () => {
    test("accepts the user's uploaded PDF or image", async () => {
      for (const receipt of [upload(1, "pdf"), upload(2, "jpg")]) {
        const { status, json } = await create(m.path, m.created, { ...m.body(), receiptFile: receipt });

        expect(status).toBe(200);
        expect(json.data.receiptFile).toBe(receipt);
      }
    });

    test("an empty receiptFile is still accepted and stored as null", async () => {
      const { status, json } = await create(m.path, m.created, { ...m.body(), receiptFile: "" });

      expect(status).toBe(200);
      expect(json.data.receiptFile).toBeNull();
    });

    for (const [label, receipt] of [["an external URL", "https://example.com/r.pdf"], ["another user's file", "STRANGER"]] as const) {
      test(`rejects ${label} with 400`, async () => {
        const url = receipt === "STRANGER" ? upload(1, "pdf", stranger.userId) : receipt;
        const { status, json } = await create(m.path, m.created, { ...m.body(), receiptFile: url });

        expect(status).toBe(400);
        expect(json).toEqual({ success: false, message: "receiptFile must be one of your uploaded files" });
      });
    }

    test("PUT rejects another user's file and clears the receipt with null", async () => {
      const { json: created } = await create(m.path, m.created, { ...m.body(), receiptFile: upload(3, "pdf") });
      const id = created.data.id;

      expect((await f.request("PUT", `${m.path}/${id}`, { receiptFile: upload(3, "pdf", stranger.userId) })).status).toBe(400);
      const cleared = await f.request("PUT", `${m.path}/${id}`, { receiptFile: null });
      expect(cleared.status).toBe(200);
      expect(cleared.json.data.receiptFile).toBeNull();
    });
  });
}

describe("/maintenance-requests photos", () => {
  const body = () => ({ propertyId, title: `Leak ${tag}`, description: "drips", category: "plumbing" });

  test("stores up to 10 of the user's uploaded images in order", async () => {
    const photos = [upload(2, "webp"), upload(1, "png")];
    const { status, json } = await create("/maintenance-requests", "maintenanceRequests", { ...body(), photos });

    expect(status).toBe(200);
    expect(json.data.photos).toEqual(photos);
  });

  const rejected: [string, string[]][] = [
    ["an external URL", ["https://example.com/a.png"]],
    ["another user's image", ["STRANGER"]],
    ["a PDF", [upload(1, "pdf")]],
    ["more than 10 photos", Array.from({ length: 11 }, (_, i) => upload(i + 1, "png"))],
  ];

  for (const [label, photos] of rejected) {
    test(`rejects ${label} with 400`, async () => {
      const resolved = photos.map((url) => (url === "STRANGER" ? upload(1, "png", stranger.userId) : url));
      const { status, json } = await create("/maintenance-requests", "maintenanceRequests", { ...body(), photos: resolved });

      expect(status).toBe(400);
      if (resolved.length <= 10) expect(json).toEqual({ success: false, message: "photos must be your uploaded JPEG, PNG or WebP files" });
    });
  }

  test("PUT replaces the photos and rejects foreign ones", async () => {
    const { json: created } = await create("/maintenance-requests", "maintenanceRequests", { ...body(), photos: [upload(1, "png")] });
    const id = created.data.id;

    const replaced = await f.request("PUT", `/maintenance-requests/${id}`, { photos: [upload(4, "jpg")] });
    expect(replaced.status).toBe(200);
    expect(replaced.json.data.photos).toEqual([upload(4, "jpg")]);
    expect((await f.request("PUT", `/maintenance-requests/${id}`, { photos: [upload(5, "png", stranger.userId)] })).status).toBe(400);
  });
});

describe("updates that leave the files out", () => {
  test("a PUT without receiptFile or photos keeps them; an empty receiptFile clears it", async () => {
    const payment = (await create("/payments", "payments", { leaseId, amount: 800, dueDate: "2026-12-05", receiptFile: upload(7, "pdf") })).json.data;
    const kept = await f.request("PUT", `/payments/${payment.id}`, { amount: 900 });
    expect(kept.json.data).toMatchObject({ amount: "900.00", receiptFile: upload(7, "pdf") });
    const cleared = await f.request("PUT", `/payments/${payment.id}`, { receiptFile: "" });
    expect(cleared.json.data.receiptFile).toBeNull();

    const request = (await create("/maintenance-requests", "maintenanceRequests", { propertyId, title: `Keep ${tag}`, description: "d", category: "general", photos: [upload(8, "png")] })).json.data;
    const keptPhotos = await f.request("PUT", `/maintenance-requests/${request.id}`, { assignedTo: "Juan" });
    expect(keptPhotos.json.data).toMatchObject({ assignedTo: "Juan", photos: [upload(8, "png")] });
  });
});
