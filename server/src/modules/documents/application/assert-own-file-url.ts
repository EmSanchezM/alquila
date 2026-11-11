import { assertUserFile } from "@server/modules/files/application/assert-user-files";

/** A document may only point at one of the caller's uploaded files. */
export const assertOwnFileUrl = (fileUrl: string | undefined, userId: string) => assertUserFile(fileUrl, userId, "fileUrl");
