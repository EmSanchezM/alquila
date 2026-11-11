import { createFileRoute } from '@tanstack/react-router'

import EditExpense from '@/features/expenses/edit'

export const Route = createFileRoute('/_authenticated/expenses/$expenseId/edit')({
  component: EditExpensePage,
})

function EditExpensePage() {
  const { expenseId } = Route.useParams()
  return <EditExpense expenseId={expenseId} />
}
