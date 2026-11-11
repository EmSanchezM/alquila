import { NotFoundError } from "@server/shared/errors";
import type { FileStorage, StoredFile } from "@server/modules/files/domain/file-storage";

// Only keys created by UploadFileUseCase: `<userId>/<uuid>.<ext>`.
const KEY_FORMAT = /^([^/]+)\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/;

export class DownloadFileUseCase {
  constructor(private readonly storage: FileStorage) {}

  /** Another user's file answers like a missing one, so keys cannot be probed. */
  async execute(key: string, userId: string): Promise<StoredFile> {
    const match = KEY_FORMAT.exec(key);
    if (!match || match[1] !== userId) throw new NotFoundError("File not found");

    const file = await this.storage.get(key);
    if (!file) throw new NotFoundError("File not found");

    return file;
  }
}
