import { createFileRoute } from '@tanstack/react-router'

import RenterDetails from '@/features/renters/details'

export const Route = createFileRoute('/_authenticated/renters/$renterId/')({
  component: RenterDetailsPage,
})

function RenterDetailsPage() {
  const { renterId } = Route.useParams()
  return <RenterDetails renterId={renterId} />
}
