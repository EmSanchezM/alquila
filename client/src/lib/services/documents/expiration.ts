// Pure, with no app imports, so it can be unit tested with bun test.

/** "expired", "soon" (within 30 days, inclusive) or null, compared with today's date (YYYY-MM-DD). */
export function expirationStatus(expirationDate: string | null, today: string): "expired" | "soon" | null {
  if (!expirationDate) return null;
  if (expirationDate < today) return "expired";
  const limit = new Date(`${today}T00:00:00Z`);
  limit.setUTCDate(limit.getUTCDate() + 30);
  return expirationDate <= limit.toISOString().slice(0, 10) ? "soon" : null;
}
