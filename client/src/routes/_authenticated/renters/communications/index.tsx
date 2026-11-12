import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import CommunicationsPage from '@/features/communications'

export const Route = createFileRoute('/_authenticated/renters/communications/')({
  // Which tab is open, so links can come back to the templates.
  validateSearch: z.object({
    tab: z.enum(['history', 'templates']).optional(),
  }),
  component: CommunicationsPage,
})
