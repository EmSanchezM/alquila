import { createFileRoute } from '@tanstack/react-router'

import EditProperty from '@/features/properties/edit'

export const Route = createFileRoute('/_authenticated/properties/$propertyId/edit')({
  component: EditPropertyPage,
})

function EditPropertyPage() {
  const { propertyId } = Route.useParams()
  return <EditProperty propertyId={propertyId} />
}
