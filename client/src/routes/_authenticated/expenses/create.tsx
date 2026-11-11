import { createFileRoute } from '@tanstack/react-router'

import CreateExpense from '@/features/expenses/create'

export const Route = createFileRoute('/_authenticated/expenses/create')({
  component: CreateExpense,
})
