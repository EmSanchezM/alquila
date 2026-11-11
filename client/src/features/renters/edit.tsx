import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import RenterForm from "@/features/renters/components/renter-form"
import { ApiError } from "@/lib/services/api-client"
import { getRenterQueryOptions, renterName, rentersQueryKey, updateRenter } from "@/lib/services/renters"
import { toRenterForm, toRenterInput, type RenterFormValues } from "@/lib/validations/renters"

interface EditRenterProps {
  renterId: string
}

const EditRenter: FC<EditRenterProps> = ({ renterId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: renter, isLoading, error, refetch } = useQuery(getRenterQueryOptions(renterId))

  const mutation = useMutation({
    mutationFn: (values: RenterFormValues) => updateRenter(renterId, toRenterInput(values)),
    onSuccess: async (updated) => {
      queryClient.setQueryData([...rentersQueryKey, updated.id], updated)
      await queryClient.invalidateQueries({ queryKey: rentersQueryKey, exact: true })
      await navigate({ to: "/renters/$renterId", params: { renterId: updated.id } })
    },
  })

  if (isLoading) {
    return <LoadingState>Loading renter...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Renter not found"
        action={<Button asChild><Link to="/renters">Back to renters</Link></Button>}
      />
    )
  }

  if (error || !renter) {
    return <LoadErrorState message="Failed to load the renter." onRetry={() => refetch()} />
  }

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/renters" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Renters
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/renters/$renterId" params={{ renterId }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {renterName(renter)}
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Renter</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <RenterForm
          defaultValues={toRenterForm(renter)}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/renters/$renterId", params: { renterId } }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditRenter
