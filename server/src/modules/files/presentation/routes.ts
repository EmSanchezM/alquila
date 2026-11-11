import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { csrf } from "hono/csrf";

import type { AuthEnv } from "@server/shared/require-auth";
import { trustedOrigins } from "@server/shared/auth";
import { AppError } from "@server/shared/errors";
import type { FileStorage } from "@server/modules/files/domain/file-storage";
import { createFileStorage } from "@server/modules/files/infrastructure/s3-file-storage";
import { MAX_FILE_SIZE, UploadFileUseCase } from "@server/modules/files/application/use-cases/upload-file";
import { DownloadFileUseCase } from "@server/modules/files/application/use-cases/download-file";

/** File routes on the given storage; null answers 503 so the rest of the API keeps working. */
export function createFileRouter(storage: FileStorage | null) {
  return new Hono<AuthEnv>()
    .use("*", async (_c, next) => {
      if (!storage) throw new AppError("File storage is not configured", 503);
      await next();
    })
    .post(
      "/",
      // A multipart POST skips the CORS preflight that protects the JSON endpoints, so check the origin.
      csrf({ origin: trustedOrigins }),
      // Stop reading oversized bodies early; the multipart envelope adds a little over the file itself.
      bodyLimit({
        maxSize: MAX_FILE_SIZE + 64 * 1024,
        onError: () => { throw new AppError("Files must be 10 MB or smaller", 413); },
      }),
      async (c) => {
        const body = await c.req.parseBody().catch(() => {
          throw new AppError("Send the file as multipart/form-data", 400);
        });
        const file = body.file;
        if (!(file instanceof File)) throw new AppError('Attach a file in the "file" field', 400);

        const uploaded = await new UploadFileUseCase(storage!).execute(file, c.get("user").id);

        return c.json({ success: true, data: uploaded });
      },
    )
    .get("/*", async (c) => {
      const key = c.req.path.replace(/^\/api\/files\//, "");
      const file = await new DownloadFileUseCase(storage!).execute(key, c.get("user").id);

      return new Response(file.body, {
        headers: {
          "content-type": file.type,
          "content-length": String(file.size),
          "cache-control": "private, max-age=3600",
          "x-content-type-options": "nosniff",
        },
      });
    });
}

export default createFileRouter(createFileStorage());
