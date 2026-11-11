import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures, signUp } from "./helpers";

const f = createFixtures();
const { tag } = f;
let stranger: { userId: string };

beforeAll(async () => {
  await f.seed();
  stranger = await signUp(`${tag}-img-stranger`);
});
afterAll(f.cleanup);

const image = (n: number, ext = "png", userId = f.userId) => `/api/files/${userId}/019a0000-0000-7000-8000-${String(n).padStart(12, "0")}.${ext}`;
const body = (images: unknown) => ({ name: `Img ${tag}`, address: "A", city: "C", country: "CR", propertyType: "house", images });

async function create(images: unknown) {
  const res = await f.request("POST", "/properties", body(images));
  if (res.status === 200) f.created.properties.push(res.json.data.id);
  return res;
}

describe("property images", () => {
  test("stores the user's uploaded images in order (the first is the cover)", async () => {
    const images = [image(2, "webp"), image(1, "jpg"), image(3, "png")];
    const { status, json } = await create(images);

    expect(status).toBe(200);
    expect(json.data.images).toEqual(images);
  });

  test("an empty list is still accepted, as before", async () => {
    const { status, json } = await create([]);

    expect(status).toBe(200);
    expect(json.data.images).toEqual([]);
  });

  const rejected: [string, unknown][] = [
    ["an external URL", ["https://example.com/a.png"]],
    ["another user's image", [image(1, "png", "STRANGER")]],
    ["a PDF upload", [image(1, "pdf")]],
    ["a path that is not an upload key", ["/api/files/USER/../x.png"]],
    ["more than 10 images", Array.from({ length: 11 }, (_, i) => image(i + 1))],
  ];

  for (const [label, images] of rejected) {
    test(`rejects ${label} with 400`, async () => {
      const resolved = (images as string[]).map((url) => url.replace("STRANGER", stranger.userId).replace("USER", f.userId));
      const { status, json } = await create(resolved);

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }

  test("PUT replaces the images, rejects foreign ones and clears them with null", async () => {
    const { json: created } = await create([image(1)]);
    const id = created.data.id;

    const replaced = await f.request("PUT", `/properties/${id}`, { images: [image(4, "jpg"), image(1)] });
    expect(replaced.status).toBe(200);
    expect(replaced.json.data.images).toEqual([image(4, "jpg"), image(1)]);

    const foreign = await f.request("PUT", `/properties/${id}`, { images: [image(5, "png", stranger.userId)] });
    expect(foreign.status).toBe(400);

    const cleared = await f.request("PUT", `/properties/${id}`, { images: null });
    expect(cleared.status).toBe(200);
    expect(cleared.json.data.images).toBeNull();
  });
});
