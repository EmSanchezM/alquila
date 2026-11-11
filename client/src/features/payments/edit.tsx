import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import PaymentForm from "@/features/payments/components/payment-form"
import { ApiError } from "@/lib/services/api-client"
import { getPaymentQueryOptions, paymentsQueryKey, updatePayment } from "@/lib/services/payments"
import { formatMoney } from "@/lib/utils/format"
import { toPaymentForm, toPaymentInput, type PaymentFormValues } from "@/lib/validations/payments"

interface EditPaymentProps {
  paymentId: string
}

const EditPayment: FC<EditPaymentProps> = ({ paymentId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: payment, isLoading, error, refetch } = useQuery(getPaymentQueryOptions(paymentId))

  const mutation = useMutation({
    mutationFn: (values: PaymentFormValues) => updatePayment(paymentId, toPaymentInput(values, payment)),
    onSuccess: async () => {
      // The update answers without names; refetch the list and the detail.
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKey })
      await navigate({ to: "/payments/$paymentId", params: { paymentId } })
    },
  })

  if (isLoading) {
    return <LoadingState>Loading payment...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Payment not found"
        action={<Button asChild><Link to="/payments">Back to payments</Link></Button>}
      />
    )
  }

  if (error || !payment) {
    return <LoadErrorState message="Failed to load the payment." onRetry={() => refetch()} />
  }

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
                <BreadcrumbLink asChild>
                  <Link to="/payments/$paymentId" params={{ paymentId }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {formatMoney(payment.amount)} · {payment.renterName}
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Payment</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <PaymentForm
          defaultValues={toPaymentForm(payment)}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/payments/$paymentId", params: { paymentId } }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditPayment
