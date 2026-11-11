import { createFileRoute } from '@tanstack/react-router'

import CreatePayment from '@/features/payments/create'

export const Route = createFileRoute('/_authenticated/payments/create')({
  component: CreatePayment,
})
