import { createFileRoute } from '@tanstack/react-router'

import EditLease from '@/features/leases/edit'

export const Route = createFileRoute('/_authenticated/leases/$leaseId/edit')({
  component: EditLeasePage,
})

function EditLeasePage() {
  const { leaseId } = Route.useParams()
  return <EditLease leaseId={leaseId} />
}
