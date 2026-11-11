import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import CreateExpense from '@/features/expenses/create'

export const Route = createFileRoute('/_authenticated/expenses/create')({
  // Preselects the property when coming from its detail page.
  validateSearch: z.object({
    propertyId: z.string().optional(),
  }),
  component: CreateExpense,
})
