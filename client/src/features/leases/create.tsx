import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import LeaseForm from "@/features/leases/components/lease-form"
import { createLease, leasesQueryKey } from "@/lib/services/leases"
import { emptyLeaseForm, toLeaseCreateInput, type LeaseFormValues } from "@/lib/validations/leases"

const CreateLease = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: LeaseFormValues) => createLease(toLeaseCreateInput(values)),
    onSuccess: async (lease) => {
      await queryClient.invalidateQueries({ queryKey: leasesQueryKey, exact: true })
      await navigate({ to: "/leases/$leaseId", params: { leaseId: lease.id } })
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
                  <Link to="/leases" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Leases
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">New lease</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">New Lease</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Link a renter to one of your properties. The property and the renter cannot be changed after the lease is created.
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <LeaseForm
          defaultValues={emptyLeaseForm}
          submitLabel="Create lease"
          pendingLabel="Creating..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/leases" }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default CreateLease
