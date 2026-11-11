import { createFileRoute } from '@tanstack/react-router'

import EditMaintenanceRequest from '@/features/maintenance/edit'

export const Route = createFileRoute('/_authenticated/maintenance/$requestId/edit')({
  component: EditMaintenanceRequestPage,
})

function EditMaintenanceRequestPage() {
  const { requestId } = Route.useParams()
  return <EditMaintenanceRequest requestId={requestId} />
}
