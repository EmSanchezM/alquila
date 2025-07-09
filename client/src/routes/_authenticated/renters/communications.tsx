import CommunicationsPage from '@/features/communications'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/renters/communications')({
  component: CommunicationsPage,
})