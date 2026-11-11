import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import CreateLease from '@/features/leases/create'

export const Route = createFileRoute('/_authenticated/leases/create')({
  // Preselects the property or renter when coming from their detail page.
  validateSearch: z.object({
    propertyId: z.string().optional(),
    renterId: z.string().optional(),
  }),
  component: CreateLease,
})
