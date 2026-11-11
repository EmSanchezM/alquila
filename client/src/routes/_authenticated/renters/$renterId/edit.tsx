import { createFileRoute } from '@tanstack/react-router'

import EditRenter from '@/features/renters/edit'

export const Route = createFileRoute('/_authenticated/renters/$renterId/edit')({
  component: EditRenterPage,
})

function EditRenterPage() {
  const { renterId } = Route.useParams()
  return <EditRenter renterId={renterId} />
}
