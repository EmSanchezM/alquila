import { Badge } from "@/components/ui/badge"
import { expirationStatus } from "@/lib/services/documents"
import { formatDay, today } from "@/lib/utils/format"

/** The expiration date, flagged when it has passed or is within 30 days. */
export default function ExpirationBadge({ expirationDate }: { expirationDate: string | null }) {
  if (!expirationDate) return <span className="text-gray-400">—</span>

  const status = expirationStatus(expirationDate, today())
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      {formatDay(expirationDate)}
      {status === "expired" && <Badge variant="destructive">Expired</Badge>}
      {status === "soon" && <Badge variant="secondary">Expires soon</Badge>}
    </span>
  )
}
