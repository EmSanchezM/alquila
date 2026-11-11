import { createFileRoute } from '@tanstack/react-router'

import PaymentDetails from '@/features/payments/details'

export const Route = createFileRoute('/_authenticated/payments/$paymentId/')({
  component: PaymentDetailsPage,
})

function PaymentDetailsPage() {
  const { paymentId } = Route.useParams()
  return <PaymentDetails paymentId={paymentId} />
}
