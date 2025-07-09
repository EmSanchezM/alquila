import { createFileRoute } from '@tanstack/react-router'

import PropertiesDetails from '@/features/properties/details'

export const Route = createFileRoute('/_authenticated/properties/$propertyId')({
  loader: async ({ params: { propertyId } }) => {
    return {
      property: { id: propertyId, title: 'Property Title', body: 'Property Body' },
    }
  },
  component: PropertiesDetailsPage,
})

function PropertiesDetailsPage() {
  const { property } = Route.useLoaderData()
  return (
    <PropertiesDetails property={property} />
  )
}