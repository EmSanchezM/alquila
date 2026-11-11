import { createFileRoute } from '@tanstack/react-router'

import CreateLease from '@/features/leases/create'

export const Route = createFileRoute('/_authenticated/leases/create')({
  component: CreateLease,
})
