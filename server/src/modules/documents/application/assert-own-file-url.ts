import { AppError } from "@server/shared/errors";
import { isUserFileUrl } from "@server/modules/files/domain/file-key";

/** A document may only point at one of the caller's uploaded files. */
export function assertOwnFileUrl(fileUrl: string | undefined, userId: string) {
  if (fileUrl !== undefined && !isUserFileUrl(fileUrl, userId)) {
    throw new AppError("fileUrl must be one of your uploaded files", 400);
  }
}
