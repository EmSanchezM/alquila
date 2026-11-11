import { AppError } from "@server/shared/errors";
import { isUserFileUrl, isUserImageUrl } from "@server/modules/files/domain/file-key";

// Records may only point at the caller's own uploads. They need the user, so the use cases call them.

/** A single file URL (an image or a PDF); null and undefined are allowed. */
export function assertUserFile(url: unknown, userId: string, field: string) {
  if (url === null || url === undefined) return;
  if (typeof url !== "string" || !isUserFileUrl(url, userId)) {
    throw new AppError(`${field} must be one of your uploaded files`, 400);
  }
}

/** A list of image URLs (JPEG, PNG or WebP); null and undefined are allowed. */
export function assertUserImages(urls: unknown, userId: string, field: string) {
  if (!Array.isArray(urls)) return;
  if (urls.some((url) => typeof url !== "string" || !isUserImageUrl(url, userId))) {
    throw new AppError(`${field} must be your uploaded JPEG, PNG or WebP files`, 400);
  }
}
