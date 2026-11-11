// Keys created by UploadFileUseCase: `<userId>/<uuid>.<ext>`, served at `/api/files/<key>`.
const KEY_FORMAT = /^([^/]+)\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/;

export const fileUrlOf = (key: string) => `/api/files/${key}`;

/** True when the key has the upload format and belongs to the user. */
export function isUserFileKey(key: string, userId: string): boolean {
  const match = KEY_FORMAT.exec(key);
  return !!match && match[1] === userId;
}

/** True when the URL points at one of the user's uploaded files. */
export function isUserFileUrl(url: string, userId: string): boolean {
  return url.startsWith("/api/files/") && isUserFileKey(url.slice("/api/files/".length), userId);
}

/** True when the URL points at one of the user's uploaded images (not a PDF). */
export function isUserImageUrl(url: string, userId: string): boolean {
  return isUserFileUrl(url, userId) && /\.(jpg|png|webp)$/.test(url);
}
