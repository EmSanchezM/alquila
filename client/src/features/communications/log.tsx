import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import CommunicationForm from "@/features/communications/components/communication-form"
import { communicationsQueryKey, createCommunication } from "@/lib/services/communications"
import { emptyCommunicationForm, toCommunicationInput, type CommunicationFormValues } from "@/lib/validations/communications"

const LogCommunication = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { renterId } = useSearch({ from: "/_authenticated/renters/communications/log" })

  const mutation = useMutation({
    mutationFn: (values: CommunicationFormValues) => createCommunication(toCommunicationInput(values)),
    onSuccess: async (communication) => {
      await queryClient.invalidateQueries({ queryKey: communicationsQueryKey, exact: true })
      await navigate({ to: "/renters/communications/$communicationId", params: { communicationId: communication.id } })
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
                  <Link to="/renters/communications" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Communications
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Log communication</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Log Communication</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Record a call, email, SMS or note with a renter. Messages are not sent from the app; this keeps the history in one place.
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <CommunicationForm
          defaultValues={emptyCommunicationForm(new Date(), renterId)}
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={renterId ? { to: "/renters/$renterId", params: { renterId } } : { to: "/renters/communications" }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default LogCommunication
