import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import MaintenanceForm from "@/features/maintenance/components/maintenance-form"
import { ApiError } from "@/lib/services/api-client"
import { getMaintenanceRequestQueryOptions, maintenanceQueryKey, updateMaintenanceRequest } from "@/lib/services/maintenance"
import { toMaintenanceForm, toMaintenanceInput, type MaintenanceFormValues } from "@/lib/validations/maintenance"

interface EditMaintenanceRequestProps {
  requestId: string
}

const EditMaintenanceRequest: FC<EditMaintenanceRequestProps> = ({ requestId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: request, isLoading, error, refetch } = useQuery(getMaintenanceRequestQueryOptions(requestId))

  const mutation = useMutation({
    mutationFn: (values: MaintenanceFormValues) => updateMaintenanceRequest(requestId, toMaintenanceInput(values, request)),
    onSuccess: async () => {
      // The update answers without names; refetch the list and the detail.
      await queryClient.invalidateQueries({ queryKey: maintenanceQueryKey })
      await navigate({ to: "/maintenance/$requestId", params: { requestId } })
    },
  })

  if (isLoading) {
    return <LoadingState>Loading maintenance request...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Maintenance request not found"
        action={<Button asChild><Link to="/maintenance">Back to maintenance</Link></Button>}
      />
    )
  }

  if (error || !request) {
    return <LoadErrorState message="Failed to load the maintenance request." onRetry={() => refetch()} />
  }

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/maintenance" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Maintenance
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/maintenance/$requestId" params={{ requestId }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {request.title}
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Maintenance Request</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <MaintenanceForm
          defaultValues={toMaintenanceForm(request)}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/maintenance/$requestId", params: { requestId } }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditMaintenanceRequest
