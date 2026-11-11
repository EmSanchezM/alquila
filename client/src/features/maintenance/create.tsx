import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import MaintenanceForm from "@/features/maintenance/components/maintenance-form"
import { createMaintenanceRequest, maintenanceQueryKey } from "@/lib/services/maintenance"
import { today } from "@/lib/utils/format"
import { emptyMaintenanceForm, toMaintenanceInput, type MaintenanceFormValues } from "@/lib/validations/maintenance"

const CreateMaintenanceRequest = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: MaintenanceFormValues) => createMaintenanceRequest(toMaintenanceInput(values)),
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: maintenanceQueryKey, exact: true })
      await navigate({ to: "/maintenance/$requestId", params: { requestId: request.id } })
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
                  <Link to="/maintenance" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Maintenance
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">New request</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">New Maintenance Request</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Log an issue in one of your properties and track it until it is fixed.
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <MaintenanceForm
          defaultValues={emptyMaintenanceForm(today())}
          submitLabel="Create request"
          pendingLabel="Creating..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/maintenance" }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default CreateMaintenanceRequest
