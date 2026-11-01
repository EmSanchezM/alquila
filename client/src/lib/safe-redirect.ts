const DEFAULT_REDIRECT = "/dashboard";

/** Returns the target only when it is an in-app path, so ?redirect= cannot send users to another site. */
export function safeRedirect(target: unknown): string {
  if (typeof target !== "string" || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return DEFAULT_REDIRECT;
  }
  return target;
}
