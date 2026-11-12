import { FC, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import { CommunicationTypeBadge, DirectionLabel } from '@/features/communications/components/communication-badges'
import { formatMoment } from '@/lib/utils/format'
import { ApiError } from '@/lib/services/api-client'
import { COMMUNICATION_STATUSES, COMMUNICATION_TYPES, getCommunicationQueryOptions } from '@/lib/services/communications'
import { labelOf } from '@/lib/utils/options'

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const CommunicationDetails: FC<{ communicationId: string }> = ({ communicationId }) => {
  const { data: communication, isLoading, error, refetch } = useQuery(getCommunicationQueryOptions(communicationId))

  if (isLoading) {
    return <LoadingState>Loading communication...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Communication not found"
        action={<Button asChild><Link to="/renters/communications">Back to communications</Link></Button>}
      />
    )
  }

  if (!communication) {
    return <LoadErrorState message="Failed to load the communication." onRetry={() => refetch()} />
  }

  const title = communication.subject ?? `${labelOf(COMMUNICATION_TYPES, communication.type)} · ${formatMoment(communication.sentAt)}`

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/renters/communications" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Communications
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
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">{title}</h2>
          <CommunicationTypeBadge type={communication.type} />
          <DirectionLabel direction={communication.direction} />
        </div>
      </header>

      <section className="grid gap-8 max-w-4xl">
        <dl className="grid gap-4 sm:grid-cols-4">
          <Detail label="When">{formatMoment(communication.sentAt)}</Detail>
          <Detail label="Status">{communication.status && labelOf(COMMUNICATION_STATUSES, communication.status)}</Detail>
          <Detail label="Renter">
            {communication.renterId && communication.renterName && (
              <Link to="/renters/$renterId" params={{ renterId: communication.renterId }} className="text-blue-600 hover:underline">
                {communication.renterName}
              </Link>
            )}
          </Detail>
          <Detail label="Property">
            {communication.propertyId && communication.propertyName && (
              <Link to="/properties/$propertyId" params={{ propertyId: communication.propertyId }} className="text-blue-600 hover:underline">
                {communication.propertyName}
              </Link>
            )}
          </Detail>
        </dl>

        <Detail label="Message">
          <p className="whitespace-pre-line rounded-md border bg-white p-4">{communication.message}</p>
        </Detail>
      </section>
    </>
  )
}

export default CommunicationDetails
