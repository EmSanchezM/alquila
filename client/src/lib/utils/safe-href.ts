// Pure, with no app imports, so it can be unit tested with bun test.

/**
 * A stored file URL that is safe to put in href or src: our own uploads, or an http(s) URL saved before
 * the file storage existed. Anything else (e.g. `javascript:`) is null and must not be rendered as a link.
 */
export function safeFileHref(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/api/files/")) return url;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
