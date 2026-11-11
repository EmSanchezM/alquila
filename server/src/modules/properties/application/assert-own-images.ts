import { AppError } from "@server/shared/errors";
import { isUserImageUrl } from "@server/modules/files/domain/file-key";

/** Property images may only be the caller's uploaded images (JPEG, PNG or WebP). */
export function assertOwnImages(images: unknown, userId: string) {
  if (!Array.isArray(images)) return;
  if (images.some((url) => typeof url !== "string" || !isUserImageUrl(url, userId))) {
    throw new AppError("images must be your uploaded JPEG, PNG or WebP files", 400);
  }
}
