import { createFileRoute } from '@tanstack/react-router'

import EditPayment from '@/features/payments/edit'

export const Route = createFileRoute('/_authenticated/payments/$paymentId/edit')({
  component: EditPaymentPage,
})

function EditPaymentPage() {
  const { paymentId } = Route.useParams()
  return <EditPayment paymentId={paymentId} />
}
