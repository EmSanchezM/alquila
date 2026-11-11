import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import PropertyForm from "@/features/properties/components/property-form"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import { ApiError } from "@/lib/services/api-client"
import { getPropertyQueryOptions, propertiesQueryKey, updateProperty } from "@/lib/services/properties"
import { toPropertyForm, toPropertyInput, type PropertyFormValues } from "@/lib/validations/properties"

interface EditPropertyProps {
  propertyId: string
}

const EditProperty: FC<EditPropertyProps> = ({ propertyId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: property, isLoading, error, refetch } = useQuery(getPropertyQueryOptions(propertyId))

  const mutation = useMutation({
    mutationFn: (values: PropertyFormValues) => updateProperty(propertyId, toPropertyInput(values, property)),
    onSuccess: async (updated) => {
      queryClient.setQueryData([...propertiesQueryKey, updated.id], updated)
      await queryClient.invalidateQueries({ queryKey: propertiesQueryKey, exact: true })
      await navigate({ to: "/properties/$propertyId", params: { propertyId: updated.id } })
    },
  })

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
                <BreadcrumbLink asChild>
                  <Link to="/properties/$propertyId" params={{ propertyId }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {property.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Property</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <PropertyForm
          defaultValues={toPropertyForm(property)}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/properties/$propertyId", params: { propertyId } }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditProperty
