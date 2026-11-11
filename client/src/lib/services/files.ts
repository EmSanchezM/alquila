import { ApiError } from "@/lib/services/api-client";

/** What POST /api/files answers for a stored file. */
export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp,application/pdf";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Uploads one file as multipart (not through apiRequest, which sends JSON). */
export async function uploadFile(file: File): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/files", { method: "POST", body: form });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(body?.message ?? "Could not upload the file. Try again.", response.status);
  }

  return body.data as UploadedFile;
}

export const isImage = (mimeType: string | null | undefined) => !!mimeType && mimeType.startsWith("image/");

export function formatFileSize(bytes: number | null | undefined) {
  if (bytes === null || bytes === undefined) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
