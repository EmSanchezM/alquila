import { createFileRoute } from '@tanstack/react-router'

import LeaseDetails from '@/features/leases/details'

export const Route = createFileRoute('/_authenticated/leases/$leaseId/')({
  component: LeaseDetailsPage,
})

function LeaseDetailsPage() {
  const { leaseId } = Route.useParams()
  return <LeaseDetails leaseId={leaseId} />
}
