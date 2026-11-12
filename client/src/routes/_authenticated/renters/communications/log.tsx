import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import LogCommunication from '@/features/communications/log'

export const Route = createFileRoute('/_authenticated/renters/communications/log')({
  // Preselects the renter when coming from their detail page.
  validateSearch: z.object({
    renterId: z.string().optional(),
  }),
  component: LogCommunication,
})
