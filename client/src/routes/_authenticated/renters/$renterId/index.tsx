import RentersDetails from '@/features/renters/details'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/renters/$renterId')({
  loader: async ({ params: { renterId } }) => {
    return {
      renter: { id: renterId, title: 'Renter Title', body: 'Renter Body' },
    }
  },
  component: RentersDetailsPage,
})

function RentersDetailsPage() {
  const { renter } = Route.useLoaderData()
  return (
    <RentersDetails renter={renter} />
  )
}