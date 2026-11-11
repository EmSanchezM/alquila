import { beforeAll, describe, expect, test } from "bun:test";

import app from "@server/app";
import { signUp, TRUSTED_ORIGIN } from "./helpers";

// Needs the S3 endpoint the test preload configures (Floci, see server/tests/setup.ts).

const tag = `files-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
let owner: { userId: string, cookie: string };
let stranger: { userId: string, cookie: string };

// The smallest valid PNG: 1x1 transparent pixel.
const PNG = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="), (c) => c.charCodeAt(0));

beforeAll(async () => {
  owner = await signUp(`${tag}-owner`);
  stranger = await signUp(`${tag}-stranger`);
});

function upload(file: File | null, cookie?: string) {
  const form = new FormData();
  if (file) form.append("file", file);
  return app.request("/api/files", {
    method: "POST",
    headers: { origin: TRUSTED_ORIGIN, ...(cookie ? { cookie } : {}) },
    body: form,
  });
}

const download = (url: string, cookie?: string) =>
  app.request(url, { headers: { origin: TRUSTED_ORIGIN, ...(cookie ? { cookie } : {}) } });

describe("POST /api/files", () => {
  test("requires a session", async () => {
    const res = await upload(new File([PNG], "pixel.png", { type: "image/png" }));

    expect(res.status).toBe(401);
  });

  test("stores an image under the user's prefix and describes it", async () => {
    const res = await upload(new File([PNG], "pixel.png", { type: "image/png" }), owner.cookie);
    const json = await res.json() as { success: boolean, data: { key: string, url: string, name: string, size: number, mimeType: string } };

    expect(res.status).toBe(200);
    expect(json.data).toMatchObject({ name: "pixel.png", size: PNG.length, mimeType: "image/png" });
    expect(json.data.key.startsWith(`${owner.userId}/`)).toBe(true);
    expect(json.data.key.endsWith(".png")).toBe(true);
    expect(json.data.url).toBe(`/api/files/${json.data.key}`);
  });

  test("accepts a PDF", async () => {
    const res = await upload(new File(["%PDF-1.4\n%%EOF"], "lease.pdf", { type: "application/pdf" }), owner.cookie);

    expect(res.status).toBe(200);
  });

  test("rejects a missing file with 400", async () => {
    const res = await upload(null, owner.cookie);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: "Attach a file in the \"file\" field" });
  });

  test("rejects an unsupported type with 415", async () => {
    const res = await upload(new File(["hello"], "notes.txt", { type: "text/plain" }), owner.cookie);

    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ success: false, message: "Only JPEG, PNG, WebP and PDF files are allowed" });
  });

  test("rejects a file over 10 MB with 413", async () => {
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.pdf", { type: "application/pdf" });
    const res = await upload(big, owner.cookie);

    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ success: false, message: "Files must be 10 MB or smaller" });
  });
});

describe("POST /api/files checks the content, the body and the origin", () => {
  test("detects the type from the content when the name has no extension", async () => {
    const res = await upload(new File([PNG], "blob", { type: "image/png" }), owner.cookie);
    const json = await res.json() as { data: { key: string, mimeType: string } };

    expect(res.status).toBe(200);
    expect(json.data.mimeType).toBe("image/png");
    expect(json.data.key.endsWith(".png")).toBe(true);
  });

  test("rejects content that is not an allowed type even with an allowed name", async () => {
    const res = await upload(new File(["<html><script>alert(1)</script></html>"], "photo.png", { type: "image/png" }), owner.cookie);

    expect(res.status).toBe(415);
  });

  test("answers 400 to a malformed multipart body", async () => {
    const res = await app.request("/api/files", {
      method: "POST",
      headers: { origin: TRUSTED_ORIGIN, cookie: owner.cookie, "content-type": "multipart/form-data; boundary=zz" },
      body: "garbage",
    });

    expect(res.status).toBe(400);
  });

  test("rejects an upload from an untrusted origin with 403", async () => {
    const form = new FormData();
    form.append("file", new File([PNG], "pixel.png", { type: "image/png" }));
    const res = await app.request("/api/files", {
      method: "POST",
      headers: { origin: "https://evil.example", cookie: owner.cookie },
      body: form,
    });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/files/:key", () => {
  test("returns the stored bytes and type to the owner", async () => {
    const { data } = await (await upload(new File([PNG], "pixel.png", { type: "image/png" }), owner.cookie)).json() as { data: { url: string } };
    const res = await download(data.url, owner.cookie);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(PNG);
  });

  test("answers 404 to another user, without a session 401", async () => {
    const { data } = await (await upload(new File([PNG], "pixel.png", { type: "image/png" }), owner.cookie)).json() as { data: { url: string } };

    expect((await download(data.url, stranger.cookie)).status).toBe(404);
    expect((await download(data.url)).status).toBe(401);
  });

  test("answers 404 for a missing key and for another user's real key reached through the owner's prefix", async () => {
    const { data } = await (await upload(new File([PNG], "pixel.png", { type: "image/png" }), stranger.cookie)).json() as { data: { key: string } };

    expect((await download(`/api/files/${owner.userId}/019a0000-0000-7000-8000-000000000000.png`, owner.cookie)).status).toBe(404);
    expect((await download(`/api/files/${owner.userId}/../${data.key}`, owner.cookie)).status).toBe(404);
    expect((await download(`/api/files/${owner.userId}/%2e%2e/${data.key}`, owner.cookie)).status).toBe(404);
  });
});

describe("without storage configured", () => {
  test("createFileStorage is null without a bucket", async () => {
    const { createFileStorage } = await import("@server/modules/files/infrastructure/s3-file-storage");

    expect(createFileStorage({ S3_REGION: "us-east-1" } as Parameters<typeof createFileStorage>[0])).toBeNull();
    expect(createFileStorage({ S3_REGION: "us-east-1", S3_BUCKET: "b" } as Parameters<typeof createFileStorage>[0])).not.toBeNull();
  });

  test("the file endpoints answer 503", async () => {
    const { Hono } = await import("hono");
    const { createFileRouter } = await import("@server/modules/files/presentation/routes");
    const { AppError } = await import("@server/shared/errors");
    const unconfigured = new Hono()
      .use("*", async (c, next) => { c.set("user" as never, { id: owner.userId } as never); await next(); })
      .route("/api/files", createFileRouter(null))
      .onError((error, c) => c.json({ success: false, message: error.message }, error instanceof AppError ? error.status : 500));

    for (const res of [
      await unconfigured.request("/api/files", { method: "POST", headers: { origin: TRUSTED_ORIGIN }, body: new FormData() }),
      await unconfigured.request(`/api/files/${owner.userId}/019a0000-0000-7000-8000-000000000000.png`),
    ]) {
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ success: false, message: "File storage is not configured" });
    }
  });
});
