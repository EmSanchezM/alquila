import { FC, ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import DeleteResourceButton from '@/components/shared/delete-resource-button'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import { ReceiptLink } from '@/components/shared/receipt'
import PaymentStatusBadge from '@/features/payments/components/payment-status-badge'
import { ApiError } from '@/lib/services/api-client'
import { deletePayment, getPaymentQueryOptions, paymentMethodLabel, paymentsQueryKey } from '@/lib/services/payments'
import { formatDay, formatMoney } from '@/lib/utils/format'

interface PaymentDetailsProps {
  paymentId: string
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const PaymentDetails: FC<PaymentDetailsProps> = ({ paymentId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: payment, isLoading, error, refetch } = useQuery(getPaymentQueryOptions(paymentId))

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

  const title = `${formatMoney(payment.amount)} · ${payment.renterName}`

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
                <BreadcrumbPage className="text-sm font-medium text-gray-900">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold leading-7 text-gray-900">{title}</h2>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/payments/$paymentId/edit" params={{ paymentId }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteResourceButton
              title="Delete this payment?"
              description="The payment will be removed from your records. This cannot be undone from the app."
              confirmLabel="Delete payment"
              onDelete={() => deletePayment(paymentId)}
              onDeleted={async () => {
                queryClient.removeQueries({ queryKey: [...paymentsQueryKey, paymentId] })
                await queryClient.invalidateQueries({ queryKey: paymentsQueryKey, exact: true })
                await navigate({ to: '/payments' })
              }}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-8 max-w-4xl">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Lease">
            <Link to="/leases/$leaseId" params={{ leaseId: payment.leaseId }} className="text-blue-600 hover:underline">
              {payment.propertyName} · {payment.renterName}
            </Link>
          </Detail>
          <Detail label="Amount">{formatMoney(payment.amount)}</Detail>
          <Detail label="Due date">{formatDay(payment.dueDate)}</Detail>
          <Detail label="Paid date">{payment.paidDate && formatDay(payment.paidDate)}</Detail>
          <Detail label="Method">{paymentMethodLabel(payment.paymentMethod)}</Detail>
          <Detail label="Reference">{payment.reference}</Detail>
          <Detail label="Receipt">{payment.receiptFile && <ReceiptLink url={payment.receiptFile} />}</Detail>
        </dl>

        <Detail label="Notes">
          {payment.notes && <p className="whitespace-pre-line">{payment.notes}</p>}
        </Detail>
      </section>
    </>
  )
}

export default PaymentDetails
