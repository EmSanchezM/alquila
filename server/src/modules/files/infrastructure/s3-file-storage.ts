import { S3Client } from "bun";

import { ProcessEnv } from "@server/shared/environment";
import type { FileStorage, StoredFile } from "@server/modules/files/domain/file-storage";

/** FileStorage on any S3-compatible service, through Bun's native S3 client. */
export class S3FileStorage implements FileStorage {
  constructor(private readonly client: S3Client) {}

  async put(key: string, data: Blob, type: string): Promise<void> {
    await this.client.write(key, data, { type });
  }

  async get(key: string): Promise<StoredFile | null> {
    const file = this.client.file(key);
    // One HEAD tells both whether the object exists and its size and type.
    const stat = await file.stat().catch((error: unknown) => {
      if ((error as { code?: string }).code === "NoSuchKey") return null;
      throw error;
    });
    if (!stat) return null;

    return { body: file.stream(), size: stat.size, type: stat.type };
  }

  async delete(key: string): Promise<void> {
    await this.client.file(key).delete();
  }
}

/** The configured storage, or null when S3_BUCKET is not set. */
export function createFileStorage(env = ProcessEnv): FileStorage | null {
  if (!env.S3_BUCKET) return null;

  return new S3FileStorage(new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    bucket: env.S3_BUCKET,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  }));
}
