import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import PaymentForm from "@/features/payments/components/payment-form"
import { createPayment, paymentsQueryKey } from "@/lib/services/payments"
import { emptyPaymentForm, toPaymentInput, type PaymentFormValues } from "@/lib/validations/payments"

const CreatePayment = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: PaymentFormValues) => createPayment(toPaymentInput(values)),
    onSuccess: async (payment) => {
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKey, exact: true })
      await navigate({ to: "/payments/$paymentId", params: { paymentId: payment.id } })
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
                  <Link to="/payments" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Payments
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Record payment</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Record Payment</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Record a payment due or received for one of your leases.
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <PaymentForm
          defaultValues={emptyPaymentForm}
          submitLabel="Record payment"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/payments" }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default CreatePayment
