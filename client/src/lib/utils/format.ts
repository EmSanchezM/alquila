/**
 * Formats a `date` column value (YYYY-MM-DD). It is read as UTC so the day does not
 * shift in time zones behind UTC.
 */
export const formatDay = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })

/** Formats a decimal column value (sent by the API as a string). */
export const formatMoney = (value: string | number) =>
  `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Today as YYYY-MM-DD in the viewer's time zone, to compare with `date` columns. */
export const today = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
