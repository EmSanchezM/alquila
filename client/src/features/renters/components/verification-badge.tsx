import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { VERIFICATION_STATUSES } from "@/lib/services/renters"

const styles = {
  verified: { variant: "default", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  pending: { variant: "secondary", icon: <Clock className="h-4 w-4 text-yellow-500" /> },
  rejected: { variant: "destructive", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
} as const

export default function VerificationBadge({ status }: { status: string | null }) {
  const value = (status ?? "pending") as keyof typeof styles
  const style = styles[value]
  const label = VERIFICATION_STATUSES.find((s) => s.value === value)?.label ?? value

  return (
    <div className="flex items-center gap-2">
      {style?.icon}
      <Badge variant={style?.variant ?? "outline"}>{label}</Badge>
    </div>
  )
}
