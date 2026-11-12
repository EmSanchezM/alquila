import { ArrowDownLeft, ArrowUpRight, Mail, MessageSquare, Phone, StickyNote } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { COMMUNICATION_TYPES } from "@/lib/services/communications"
import { labelOf } from "@/lib/utils/options"

const icons: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  sms: <MessageSquare className="h-3.5 w-3.5" />,
  call: <Phone className="h-3.5 w-3.5" />,
  note: <StickyNote className="h-3.5 w-3.5" />,
}

export function CommunicationTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className="gap-1">
      {icons[type]}
      {labelOf(COMMUNICATION_TYPES, type)}
    </Badge>
  )
}

export function DirectionLabel({ direction }: { direction: string }) {
  return direction === "inbound" ? (
    <span className="inline-flex items-center gap-1 text-sm text-green-700"><ArrowDownLeft className="h-4 w-4" />Inbound</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm text-blue-700"><ArrowUpRight className="h-4 w-4" />Outbound</span>
  )
}
