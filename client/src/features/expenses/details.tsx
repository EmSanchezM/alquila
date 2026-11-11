import { FC, ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import DeleteResourceButton from '@/components/shared/delete-resource-button'
import { ReceiptLink } from '@/components/shared/receipt'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import { ApiError } from '@/lib/services/api-client'
import { deleteExpense, EXPENSE_CATEGORIES, expensesQueryKey, getExpenseQueryOptions, RECURRING_FREQUENCIES } from '@/lib/services/expenses'
import { formatDay, formatMoney } from '@/lib/utils/format'
import { labelOf } from '@/lib/utils/options'

interface ExpenseDetailsProps {
  expenseId: string
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const ExpenseDetails: FC<ExpenseDetailsProps> = ({ expenseId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: expense, isLoading, error, refetch } = useQuery(getExpenseQueryOptions(expenseId))

  if (isLoading) {
    return <LoadingState>Loading expense...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Expense not found"
        action={<Button asChild><Link to="/expenses">Back to expenses</Link></Button>}
      />
    )
  }

  if (error || !expense) {
    return <LoadErrorState message="Failed to load the expense." onRetry={() => refetch()} />
  }

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/expenses" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Expenses
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">{expense.description}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900">{expense.description}</h2>
            <p className="mt-1 text-sm text-gray-500">{formatMoney(expense.amount)} · {formatDay(expense.expenseDate)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/expenses/$expenseId/edit" params={{ expenseId }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteResourceButton
              title={`Delete "${expense.description}"?`}
              description="The expense will be removed from your records. This cannot be undone from the app."
              confirmLabel="Delete expense"
              onDelete={() => deleteExpense(expenseId)}
              onDeleted={async () => {
                queryClient.removeQueries({ queryKey: [...expensesQueryKey, expenseId] })
                await queryClient.invalidateQueries({ queryKey: expensesQueryKey, exact: true })
                await navigate({ to: '/expenses' })
              }}
            />
          </div>
        </div>
      </header>

      <section className="grid gap-8 max-w-4xl">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Property">
            {expense.propertyId && expense.propertyName ? (
              <Link to="/properties/$propertyId" params={{ propertyId: expense.propertyId }} className="text-blue-600 hover:underline">
                {expense.propertyName}
              </Link>
            ) : 'General (no property)'}
          </Detail>
          <Detail label="Category">{labelOf(EXPENSE_CATEGORIES, expense.category)}</Detail>
          <Detail label="Amount">{formatMoney(expense.amount)}</Detail>
          <Detail label="Date">{formatDay(expense.expenseDate)}</Detail>
          <Detail label="Vendor">{expense.vendor}</Detail>
          <Detail label="Receipt">{expense.receiptFile && <ReceiptLink url={expense.receiptFile} />}</Detail>
          <Detail label="Repeats">
            {expense.isRecurring ? labelOf(RECURRING_FREQUENCIES, expense.recurringFrequency ?? '') : 'No (one-off)'}
          </Detail>
        </dl>

        <Detail label="Notes">
          {expense.notes && <p className="whitespace-pre-line">{expense.notes}</p>}
        </Detail>
      </section>
    </>
  )
}

export default ExpenseDetails
