import { FC, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Bath, Bed, MapPin, Pencil, Square } from 'lucide-react'

import placeholder from '@/assets/placeholder.svg'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import ExpenseSection from '@/features/expenses/components/expense-section'
import LeaseSection from '@/features/leases/components/lease-section'
import DeletePropertyButton from '@/features/properties/components/delete-property-button'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import { ApiError } from '@/lib/services/api-client'
import { getPropertyQueryOptions } from '@/lib/services/properties'

interface PropertiesDetailsProps {
  propertyId: string
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const PropertiesDetails: FC<PropertiesDetailsProps> = ({ propertyId }) => {
  const { data: property, isLoading, error, refetch } = useQuery(getPropertyQueryOptions(propertyId))

  if (isLoading) {
    return <LoadingState>Loading property...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Property not found"
        action={<Button asChild><Link to="/properties">Back to properties</Link></Button>}
      />
    )
  }

  if (error || !property) {
    return <LoadErrorState message="Failed to load the property." onRetry={() => refetch()} />
  }

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/properties" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Properties
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">
                  {property.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900">{property.name}</h2>
            <p className="mt-1 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1 shrink-0" />
              {[property.address, property.city, property.state, property.zipCode, property.country].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/properties/$propertyId/edit" params={{ propertyId }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeletePropertyButton propertyId={propertyId} propertyName={property.name} />
          </div>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-2 max-w-5xl">
        <img
          src={placeholder}
          alt={property.name}
          className="w-full aspect-video object-cover rounded-lg border"
          width={600}
          height={338}
        />

        <div className="grid gap-6 content-start">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-gray-500" />
              <span>{property.bedrooms ?? '—'} bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-gray-500" />
              <span>{property.bathrooms ?? '—'} bathrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5 text-gray-500" />
              <span>{property.squareMeters ? `${Number(property.squareMeters)} m²` : '—'}</span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <Detail label="Type">{property.propertyType}</Detail>
            <Detail label="Country">{property.country}</Detail>
            <Detail label="City">{property.city}</Detail>
            <Detail label="State">{property.state}</Detail>
            <Detail label="ZIP code">{property.zipCode}</Detail>
          </dl>

          <Detail label="Description">
            {property.description && <p className="whitespace-pre-line">{property.description}</p>}
          </Detail>
        </div>
      </section>

      <div className="mt-10 grid gap-10 max-w-5xl">
        <LeaseSection propertyId={propertyId} />
        <ExpenseSection propertyId={propertyId} />
      </div>
    </>
  )
}

export default PropertiesDetails
