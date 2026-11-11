import { createFileRoute } from '@tanstack/react-router'

import PropertiesDetails from '@/features/properties/details'

export const Route = createFileRoute('/_authenticated/properties/$propertyId/')({
  component: PropertiesDetailsPage,
})

function PropertiesDetailsPage() {
  const { propertyId } = Route.useParams()
  return <PropertiesDetails propertyId={propertyId} />
}
