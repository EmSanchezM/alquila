import { NotFoundError } from "@server/shared/errors";
import type { FileStorage, StoredFile } from "@server/modules/files/domain/file-storage";
import { isUserFileKey } from "@server/modules/files/domain/file-key";

export class DownloadFileUseCase {
  constructor(private readonly storage: FileStorage) {}

  /** Another user's file answers like a missing one, so keys cannot be probed. */
  async execute(key: string, userId: string): Promise<StoredFile> {
    if (!isUserFileKey(key, userId)) throw new NotFoundError("File not found");

    const file = await this.storage.get(key);
    if (!file) throw new NotFoundError("File not found");

    return file;
  }
}
