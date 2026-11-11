// Pure, with no app imports, so it can be unit tested with bun test.

/**
 * A stored file URL that is safe to put in href or src: our own uploads, or an http(s) URL saved before
 * the file storage existed. Anything else (e.g. `javascript:`) is null and must not be rendered as a link.
 */
const UPLOAD_URL = /^\/api\/files\/[^/.]+\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/;

export function safeFileHref(url: string | null | undefined): string | null {
  if (!url) return null;
  // Our uploads only in their exact key shape (`/api/files/<userId>/<uuid>.<ext>`), so `..` cannot point elsewhere.
  if (url.startsWith("/api/files/")) return UPLOAD_URL.test(url) ? url : null;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
