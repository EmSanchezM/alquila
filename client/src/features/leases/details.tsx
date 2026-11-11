import { FC, ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import DeleteResourceButton from '@/components/shared/delete-resource-button'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import LeaseStatusBadge from '@/features/leases/components/lease-status-badge'
import { ApiError } from '@/lib/services/api-client'
import { deleteLease, getLeaseQueryOptions, leasesQueryKey } from '@/lib/services/leases'
import { formatDay, formatMoney } from '@/lib/utils/format'

interface LeaseDetailsProps {
  leaseId: string
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const LeaseDetails: FC<LeaseDetailsProps> = ({ leaseId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: lease, isLoading, error, refetch } = useQuery(getLeaseQueryOptions(leaseId))

  if (isLoading) {
    return <LoadingState>Loading lease...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Lease not found"
        action={<Button asChild><Link to="/leases">Back to leases</Link></Button>}
      />
    )
  }

  if (error || !lease) {
    return <LoadErrorState message="Failed to load the lease." onRetry={() => refetch()} />
  }

  const title = `${lease.propertyName} · ${lease.renterName}`

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/leases" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Leases
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold leading-7 text-gray-900">{title}</h2>
            <LeaseStatusBadge status={lease.status} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/leases/$leaseId/edit" params={{ leaseId }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteResourceButton
              title="Delete this lease?"
              description="The lease will be removed from your account. This cannot be undone from the app."
              confirmLabel="Delete lease"
              onDelete={() => deleteLease(leaseId)}
              onDeleted={async () => {
                queryClient.removeQueries({ queryKey: [...leasesQueryKey, leaseId] })
                await queryClient.invalidateQueries({ queryKey: leasesQueryKey, exact: true })
                await navigate({ to: '/leases' })
              }}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-8 max-w-4xl">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Property">
            <Link to="/properties/$propertyId" params={{ propertyId: lease.propertyId }} className="text-blue-600 hover:underline">
              {lease.propertyName}
            </Link>
          </Detail>
          <Detail label="Renter">
            <Link to="/renters/$renterId" params={{ renterId: lease.renterId }} className="text-blue-600 hover:underline">
              {lease.renterName}
            </Link>
          </Detail>
          <Detail label="Start date">{formatDay(lease.startDate)}</Detail>
          <Detail label="End date">{formatDay(lease.endDate)}</Detail>
          <Detail label="Monthly rent">{formatMoney(lease.monthlyRent)}</Detail>
          <Detail label="Security deposit">{lease.securityDeposit !== null && formatMoney(lease.securityDeposit)}</Detail>
          <Detail label="Payment due day">Day {lease.paymentDueDay} of each month</Detail>
          <Detail label="Renews automatically">{lease.autoRenew ? 'Yes' : 'No'}</Detail>
        </dl>

        <Detail label="Terms">
          {lease.terms && <p className="whitespace-pre-line">{lease.terms}</p>}
        </Detail>
      </section>
    </>
  )
}

export default LeaseDetails
