import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadErrorState } from "@/components/shared/resource-states"
import LeaseStatusBadge from "@/features/leases/components/lease-status-badge"
import { getAllLeasesQueryOptions } from "@/lib/services/leases"
import { formatDay, formatMoney } from "@/lib/utils/format"

type LeaseSectionProps =
  | { propertyId: string, renterId?: never }
  | { renterId: string, propertyId?: never }

/**
 * The leases of one property or one renter. Filters the cached leases list instead of a dedicated
 * request: lists are per user and small.
 */
export default function LeaseSection({ propertyId, renterId }: LeaseSectionProps) {
  const { data: leases = [], isLoading, error, refetch } = useQuery(getAllLeasesQueryOptions)

  const own = leases
    .filter((lease) => (propertyId ? lease.propertyId === propertyId : lease.renterId === renterId))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
  const otherParty = propertyId ? "Renter" : "Property"

  return (
    <section className="grid gap-3" aria-labelledby="leases-heading">
      <div className="flex items-center justify-between gap-4">
        <h3 id="leases-heading" className="text-lg font-semibold text-gray-900">Leases</h3>
        <Button variant="outline" size="sm" asChild>
          <Link to="/leases/create" search={propertyId ? { propertyId } : { renterId }}>
            <Plus className="h-4 w-4 mr-2" />
            New lease
          </Link>
        </Button>
      </div>

      {error && <LoadErrorState message="Failed to load leases." onRetry={() => refetch()} />}
      {isLoading && <p className="text-sm text-gray-500">Loading leases...</p>}
      {!isLoading && !error && own.length === 0 && <p className="text-sm text-gray-500">No leases yet.</p>}

      {own.length > 0 && (
        <div className="overflow-x-auto rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{otherParty}</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Monthly rent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {own.map((lease) => (
                <TableRow key={lease.id}>
                  <TableCell className="font-medium">
                    <Link to="/leases/$leaseId" params={{ leaseId: lease.id }} className="text-blue-600 hover:underline">
                      {propertyId ? lease.renterName : lease.propertyName}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDay(lease.startDate)} – {formatDay(lease.endDate)}</TableCell>
                  <TableCell className="text-right">{formatMoney(lease.monthlyRent)}</TableCell>
                  <TableCell><LeaseStatusBadge status={lease.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
