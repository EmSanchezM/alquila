import { createFileRoute } from '@tanstack/react-router'

import CommunicationDetails from '@/features/communications/details'

export const Route = createFileRoute('/_authenticated/renters/communications/$communicationId')({
  component: CommunicationDetailsPage,
})

function CommunicationDetailsPage() {
  const { communicationId } = Route.useParams()
  return <CommunicationDetails communicationId={communicationId} />
}
