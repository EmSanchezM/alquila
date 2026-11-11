import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import PropertyForm from "@/features/properties/components/property-form";
import { createProperty, propertiesQueryKey } from "@/lib/services/properties";
import { emptyPropertyForm, toPropertyInput, type PropertyFormValues } from "@/lib/validations/properties";

const CreateProperty = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: PropertyFormValues) => createProperty(toPropertyInput(values)),
    onSuccess: async (property) => {
      queryClient.setQueryData([...propertiesQueryKey, property.id], property)
      await queryClient.invalidateQueries({ queryKey: propertiesQueryKey, exact: true })
      await navigate({ to: "/properties/$propertyId", params: { propertyId: property.id } })
    },
  })

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
                Create property
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">
            Create New Property
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Add a new property to your portfolio by filling out the form below. Make sure to include all relevant details
            such as location, amenities, and property specifications to provide accurate information for potential clients.
          </p>
        </div>
      </div>
    </header>
    <section className="mt-8 max-w-4xl">
      <PropertyForm
        defaultValues={emptyPropertyForm}
        submitLabel="Create property"
        pendingLabel="Creating..."
        isPending={mutation.isPending}
        error={mutation.error?.message ?? null}
        cancel={{ to: "/properties" }}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </section>
    </>
  )
}

export default CreateProperty
