import { FC, ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import DeleteResourceButton from '@/components/shared/delete-resource-button'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import LeaseSection from '@/features/leases/components/lease-section'
import VerificationBadge from '@/features/renters/components/verification-badge'
import { ApiError } from '@/lib/services/api-client'
import { deleteRenter, emergencyContactOf, getRenterQueryOptions, renterName, rentersQueryKey } from '@/lib/services/renters'

interface RenterDetailsProps {
  renterId: string
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const RenterDetails: FC<RenterDetailsProps> = ({ renterId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: renter, isLoading, error, refetch } = useQuery(getRenterQueryOptions(renterId))

  if (isLoading) {
    return <LoadingState>Loading renter...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Renter not found"
        action={<Button asChild><Link to="/renters">Back to renters</Link></Button>}
      />
    )
  }

  if (error || !renter) {
    return <LoadErrorState message="Failed to load the renter." onRetry={() => refetch()} />
  }

  const name = renterName(renter)
  const contact = emergencyContactOf(renter)

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/renters" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Renters
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">{name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold leading-7 text-gray-900">{name}</h2>
            <VerificationBadge status={renter.verificationStatus} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/renters/$renterId/edit" params={{ renterId }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteResourceButton
              title={`Delete ${name}?`}
              description="The renter will be removed from your account. This cannot be undone from the app."
              confirmLabel="Delete renter"
              onDelete={() => deleteRenter(renterId)}
              onDeleted={async () => {
                queryClient.removeQueries({ queryKey: [...rentersQueryKey, renterId] })
                await queryClient.invalidateQueries({ queryKey: rentersQueryKey, exact: true })
                await navigate({ to: '/renters' })
              }}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-8 max-w-4xl">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Email">{renter.email}</Detail>
          <Detail label="Phone">{renter.phoneNumber}</Detail>
          <Detail label="ID number">{renter.dniNumber}</Detail>
        </dl>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Emergency contact</h3>
          {contact ? (
            <dl className="grid gap-4 sm:grid-cols-3">
              <Detail label="Name">{contact.name}</Detail>
              <Detail label="Phone">{contact.phone}</Detail>
              <Detail label="Relationship">{contact.relationship}</Detail>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No emergency contact.</p>
          )}
        </div>

        <Detail label="Notes">
          {renter.notes && <p className="whitespace-pre-line">{renter.notes}</p>}
        </Detail>
      </section>

      <div className="mt-10 max-w-4xl">
        <LeaseSection renterId={renterId} />
      </div>
    </>
  )
}

export default RenterDetails
