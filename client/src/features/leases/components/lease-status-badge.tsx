import { Badge } from "@/components/ui/badge"
import { LEASE_STATUSES } from "@/lib/services/leases"

const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "secondary",
  expired: "outline",
  terminated: "destructive",
}

export default function LeaseStatusBadge({ status }: { status: string }) {
  const label = LEASE_STATUSES.find((s) => s.value === status)?.label ?? status
  return <Badge variant={variants[status] ?? "outline"}>{label}</Badge>
}
