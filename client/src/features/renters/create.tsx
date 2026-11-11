import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import RenterForm from "@/features/renters/components/renter-form"
import { createRenter, rentersQueryKey } from "@/lib/services/renters"
import { emptyRenterForm, toRenterInput, type RenterFormValues } from "@/lib/validations/renters"

const CreateRenter = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: RenterFormValues) => createRenter(toRenterInput(values)),
    onSuccess: async (renter) => {
      queryClient.setQueryData([...rentersQueryKey, renter.id], renter)
      await queryClient.invalidateQueries({ queryKey: rentersQueryKey, exact: true })
      await navigate({ to: "/renters/$renterId", params: { renterId: renter.id } })
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
                  <Link to="/renters" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Renters
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Add renter</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Add Renter</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Register a renter to link them to a lease later.
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <RenterForm
          defaultValues={emptyRenterForm}
          submitLabel="Add renter"
          pendingLabel="Adding..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/renters" }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default CreateRenter
