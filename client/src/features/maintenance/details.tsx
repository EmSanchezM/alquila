import { FC, ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import DeleteResourceButton from '@/components/shared/delete-resource-button'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from '@/features/maintenance/components/maintenance-badges'
import { ApiError } from '@/lib/services/api-client'
import {
  deleteMaintenanceRequest,
  getMaintenanceRequestQueryOptions,
  labelOf,
  MAINTENANCE_CATEGORIES,
  maintenanceQueryKey,
} from '@/lib/services/maintenance'
import { formatDay, formatMoney } from '@/lib/utils/format'

interface MaintenanceDetailsProps {
  requestId: string
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const day = (timestamp: string | null) => timestamp && formatDay(timestamp.slice(0, 10))

const MaintenanceDetails: FC<MaintenanceDetailsProps> = ({ requestId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: request, isLoading, error, refetch } = useQuery(getMaintenanceRequestQueryOptions(requestId))

  if (isLoading) {
    return <LoadingState>Loading maintenance request...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Maintenance request not found"
        action={<Button asChild><Link to="/maintenance">Back to maintenance</Link></Button>}
      />
    )
  }

  if (error || !request) {
    return <LoadErrorState message="Failed to load the maintenance request." onRetry={() => refetch()} />
  }

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/maintenance" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Maintenance
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">{request.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold leading-7 text-gray-900">{request.title}</h2>
            <MaintenanceStatusBadge status={request.status} />
            <MaintenancePriorityBadge priority={request.priority} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/maintenance/$requestId/edit" params={{ requestId }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteResourceButton
              title={`Delete "${request.title}"?`}
              description="The request will be removed from your records. This cannot be undone from the app."
              confirmLabel="Delete request"
              onDelete={() => deleteMaintenanceRequest(requestId)}
              onDeleted={async () => {
                queryClient.removeQueries({ queryKey: [...maintenanceQueryKey, requestId] })
                await queryClient.invalidateQueries({ queryKey: maintenanceQueryKey, exact: true })
                await navigate({ to: '/maintenance' })
              }}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-8 max-w-4xl">
        <Detail label="Description">
          <p className="whitespace-pre-line">{request.description}</p>
        </Detail>

        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Property">
            <Link to="/properties/$propertyId" params={{ propertyId: request.propertyId }} className="text-blue-600 hover:underline">
              {request.propertyName}
            </Link>
          </Detail>
          <Detail label="Reported by">
            {request.renterId && request.renterName && (
              <Link to="/renters/$renterId" params={{ renterId: request.renterId }} className="text-blue-600 hover:underline">
                {request.renterName}
              </Link>
            )}
          </Detail>
          <Detail label="Category">{labelOf(MAINTENANCE_CATEGORIES, request.category)}</Detail>
          <Detail label="Reported">{day(request.reportedDate)}</Detail>
          <Detail label="Scheduled">{day(request.scheduledDate)}</Detail>
          <Detail label="Completed">{day(request.completedDate)}</Detail>
          <Detail label="Assigned to">{request.assignedTo}</Detail>
          <Detail label="Estimated cost">{request.estimatedCost !== null && formatMoney(request.estimatedCost)}</Detail>
          <Detail label="Actual cost">{request.actualCost !== null && formatMoney(request.actualCost)}</Detail>
        </dl>

        <Detail label="Notes">
          {request.notes && <p className="whitespace-pre-line">{request.notes}</p>}
        </Detail>
      </section>
    </>
  )
}

export default MaintenanceDetails
