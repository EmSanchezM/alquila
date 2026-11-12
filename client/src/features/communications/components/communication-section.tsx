import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadErrorState } from "@/components/shared/resource-states"
import { CommunicationTypeBadge, DirectionLabel } from "@/features/communications/components/communication-badges"
import { formatMoment } from "@/lib/utils/format"
import { getAllCommunicationsQueryOptions } from "@/lib/services/communications"

const LIMIT = 5

/** The latest communications with one renter. Filters the cached log: lists are per user and small. */
export default function CommunicationSection({ renterId }: { renterId: string }) {
  const { data: communications = [], isLoading, error, refetch } = useQuery(getAllCommunicationsQueryOptions)
  const own = communications.filter((c) => c.renterId === renterId)

  return (
    <section className="grid gap-3" aria-labelledby="communications-heading">
      <div className="flex items-center justify-between gap-4">
        <h3 id="communications-heading" className="text-lg font-semibold text-gray-900">
          Communications {own.length > LIMIT && <span className="text-sm font-normal text-gray-500">· latest {LIMIT} of {own.length}</span>}
        </h3>
        <Button variant="outline" size="sm" asChild>
          <Link to="/renters/communications/log" search={{ renterId }}>
            <Plus className="h-4 w-4 mr-2" />
            Log communication
          </Link>
        </Button>
      </div>

      {error && !communications.length && <LoadErrorState message="Failed to load communications." onRetry={() => refetch()} />}
      {isLoading && <p className="text-sm text-gray-500">Loading communications...</p>}
      {!isLoading && own.length === 0 && !(error && !communications.length) && <p className="text-sm text-gray-500">No communications yet.</p>}

      {own.length > 0 && (
        <ul className="divide-y rounded-md border bg-white">
          {own.slice(0, LIMIT).map((c) => (
            <li key={c.id}>
              <Link to="/renters/communications/$communicationId" params={{ communicationId: c.id }} className="flex flex-wrap items-center gap-3 p-3 hover:bg-gray-50">
                <span className="text-sm text-gray-500 whitespace-nowrap">{formatMoment(c.sentAt)}</span>
                <CommunicationTypeBadge type={c.type} />
                <DirectionLabel direction={c.direction} />
                <span className="text-sm text-gray-900 truncate flex-1 min-w-0">{c.subject ?? c.message}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
