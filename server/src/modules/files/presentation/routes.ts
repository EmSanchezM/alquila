import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

import type { AuthEnv } from "@server/shared/require-auth";
import { AppError } from "@server/shared/errors";
import { createFileStorage } from "@server/modules/files/infrastructure/s3-file-storage";
import { MAX_FILE_SIZE, UploadFileUseCase } from "@server/modules/files/application/use-cases/upload-file";
import { DownloadFileUseCase } from "@server/modules/files/application/use-cases/download-file";

const fileRouter = new Hono<AuthEnv>();
const storage = createFileStorage();

fileRouter
  .use("*", async (_c, next) => {
    if (!storage) throw new AppError("File storage is not configured", 503);
    await next();
  })
  .post(
    "/",
    // Stop reading oversized bodies early; the multipart envelope adds a little over the file itself.
    bodyLimit({
      maxSize: MAX_FILE_SIZE + 64 * 1024,
      onError: () => { throw new AppError("Files must be 10 MB or smaller", 413); },
    }),
    async (c) => {
      const body = await c.req.parseBody();
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

export default fileRouter;
