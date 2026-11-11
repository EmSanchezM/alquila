import { Badge } from "@/components/ui/badge"
import { labelOf, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from "@/lib/services/maintenance"

type Variant = "default" | "secondary" | "destructive" | "outline"

const statusVariants: Record<string, Variant> = {
  open: "destructive",
  in_progress: "default",
  completed: "secondary",
  closed: "outline",
}

const priorityVariants: Record<string, Variant> = {
  urgent: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
}

export function MaintenanceStatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariants[status] ?? "outline"}>{labelOf(MAINTENANCE_STATUSES, status)}</Badge>
}

export function MaintenancePriorityBadge({ priority }: { priority: string }) {
  return <Badge variant={priorityVariants[priority] ?? "outline"}>{labelOf(MAINTENANCE_PRIORITIES, priority)}</Badge>
}
