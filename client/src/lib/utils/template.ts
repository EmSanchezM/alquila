// Pure, with no app imports, so it can be unit tested with bun test.

export type TemplateValues = Partial<Record<"tenant_name" | "property_name" | "amount" | "due_date", string>>;

/** Replaces {{variable}} with its value; variables without a value are left as they are. */
export function renderTemplate(text: string, values: TemplateValues): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (placeholder, name: string) =>
    values[name as keyof TemplateValues] ?? placeholder,
  );
}

/**
 * The next date (YYYY-MM-DD) on or after `today` that falls on the lease's payment day. Months shorter
 * than the day use their last day (a payment day of 31 is the 30th in April).
 */
export function nextDueDate(today: string, paymentDueDay: number): string {
  const [year, month] = today.split("-").map(Number) as [number, number];
  const onMonth = (y: number, m: number) => {
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate(); // m is 1-based here
    const d = Math.min(paymentDueDay, lastDay);
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };
  const thisMonth = onMonth(year, month);
  if (thisMonth >= today) return thisMonth;
  return month === 12 ? onMonth(year + 1, 1) : onMonth(year, month + 1);
}
