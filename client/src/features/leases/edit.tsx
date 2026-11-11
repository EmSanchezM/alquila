import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import LeaseForm from "@/features/leases/components/lease-form"
import { ApiError } from "@/lib/services/api-client"
import { getLeaseQueryOptions, leasesQueryKey, updateLease } from "@/lib/services/leases"
import { toLeaseForm, toLeaseUpdateInput, type LeaseFormValues } from "@/lib/validations/leases"

interface EditLeaseProps {
  leaseId: string
}

const EditLease: FC<EditLeaseProps> = ({ leaseId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: lease, isLoading, error, refetch } = useQuery(getLeaseQueryOptions(leaseId))

  const mutation = useMutation({
    mutationFn: (values: LeaseFormValues) => updateLease(leaseId, toLeaseUpdateInput(values)),
    onSuccess: async () => {
      // The update answers without names; refetch the list and the detail.
      await queryClient.invalidateQueries({ queryKey: leasesQueryKey })
      await navigate({ to: "/leases/$leaseId", params: { leaseId } })
    },
  })

  if (isLoading) {
    return <LoadingState>Loading lease...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Lease not found"
        action={<Button asChild><Link to="/leases">Back to leases</Link></Button>}
      />
    )
  }

  if (error || !lease) {
    return <LoadErrorState message="Failed to load the lease." onRetry={() => refetch()} />
  }

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
                <BreadcrumbLink asChild>
                  <Link to="/leases/$leaseId" params={{ leaseId }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {lease.propertyName} · {lease.renterName}
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Lease</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <LeaseForm
          defaultValues={toLeaseForm(lease)}
          fixedParties={{ propertyName: lease.propertyName, renterName: lease.renterName }}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/leases/$leaseId", params: { leaseId } }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditLease
