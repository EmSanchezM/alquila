import { assertUserImages } from "@server/modules/files/application/assert-user-files";

/** Property images may only be the caller's uploaded images (JPEG, PNG or WebP). */
export const assertOwnImages = (images: unknown, userId: string) => assertUserImages(images, userId, "images");
