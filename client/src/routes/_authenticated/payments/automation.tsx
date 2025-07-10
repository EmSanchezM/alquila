import PaymentAutomationPage from '@/features/automation'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_authenticated/payments/automation')({
  component: PaymentAutomationPage,
})