import RentersPage from '@/features/renters'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/renters/')({
  component: RentersPage,
})