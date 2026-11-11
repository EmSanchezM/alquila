import { AlertCircle, CheckCircle, Clock, CircleDashed } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { PAYMENT_STATUSES } from "@/lib/services/payments"

const styles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode }> = {
  paid: { variant: "default", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  pending: { variant: "secondary", icon: <Clock className="h-4 w-4 text-yellow-500" /> },
  partial: { variant: "outline", icon: <CircleDashed className="h-4 w-4 text-blue-500" /> },
  overdue: { variant: "destructive", icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
}

export default function PaymentStatusBadge({ status }: { status: string }) {
  const style = styles[status]
  const label = PAYMENT_STATUSES.find((s) => s.value === status)?.label ?? status

  return (
    <div className="flex items-center gap-2">
      {style?.icon}
      <Badge variant={style?.variant ?? "outline"}>{label}</Badge>
    </div>
  )
}
