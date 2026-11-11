import { AppError } from "@server/shared/errors";
import { generateUuid } from "@server/shared/generate-uuid";
import type { FileStorage } from "@server/modules/files/domain/file-storage";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed types, the extension each one is stored with, and its leading bytes.
const SIGNATURES: { type: string, extension: string, matches: (head: Uint8Array) => boolean }[] = [
  { type: "image/jpeg", extension: "jpg", matches: (h) => h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff },
  { type: "image/png", extension: "png", matches: (h) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => h[i] === b) },
  { type: "image/webp", extension: "webp", matches: (h) => ascii(h, 0, 4) === "RIFF" && ascii(h, 8, 12) === "WEBP" },
  { type: "application/pdf", extension: "pdf", matches: (h) => ascii(h, 0, 5) === "%PDF-" },
];

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));

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
    if (file.size > MAX_FILE_SIZE) throw new AppError("Files must be 10 MB or smaller", 413);

    // The type comes from the content, not the name or the declared type: Bun derives File.type from
    // the file name, so a renamed file would otherwise pass and a name without extension would not.
    // parseBody already holds the file in memory (10 MB at most), so reading it is cheap.
    const head = new Uint8Array(await file.arrayBuffer(), 0, Math.min(12, file.size));
    const kind = SIGNATURES.find((signature) => signature.matches(head));
    if (!kind) throw new AppError("Only JPEG, PNG, WebP and PDF files are allowed", 415);

    // The user's id prefixes every key, so a key alone tells who owns the file.
    const key = `${userId}/${generateUuid()}.${kind.extension}`;
    await this.storage.put(key, file, kind.type);

    return { key, url: `/api/files/${key}`, name: file.name, size: file.size, mimeType: kind.type };
  }
}
