import { AppError } from "@server/shared/errors";
import { generateUuid } from "@server/shared/generate-uuid";
import type { FileStorage } from "@server/modules/files/domain/file-storage";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed types and the extension each one is stored with.
export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export class UploadFileUseCase {
  constructor(private readonly storage: FileStorage) {}

  async execute(file: File, userId: string): Promise<UploadedFile> {
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) throw new AppError("Only JPEG, PNG, WebP and PDF files are allowed", 415);
    if (file.size > MAX_FILE_SIZE) throw new AppError("Files must be 10 MB or smaller", 413);

    // The user's id prefixes every key, so a key alone tells who owns the file.
    const key = `${userId}/${generateUuid()}.${extension}`;
    await this.storage.put(key, file, file.type);

    return { key, url: `/api/files/${key}`, name: file.name, size: file.size, mimeType: file.type };
  }
}
