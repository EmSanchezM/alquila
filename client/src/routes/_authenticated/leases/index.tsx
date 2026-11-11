import { createFileRoute } from '@tanstack/react-router'

import LeasesPage from '@/features/leases'

export const Route = createFileRoute('/_authenticated/leases/')({
  component: LeasesPage,
})
