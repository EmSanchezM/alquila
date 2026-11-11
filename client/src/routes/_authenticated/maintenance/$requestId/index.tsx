import { createFileRoute } from '@tanstack/react-router'

import MaintenanceDetails from '@/features/maintenance/details'

export const Route = createFileRoute('/_authenticated/maintenance/$requestId/')({
  component: MaintenanceDetailsPage,
})

function MaintenanceDetailsPage() {
  const { requestId } = Route.useParams()
  return <MaintenanceDetails requestId={requestId} />
}
