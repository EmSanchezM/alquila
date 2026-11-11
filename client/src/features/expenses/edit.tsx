import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import ExpenseForm from "@/features/expenses/components/expense-form"
import { ApiError } from "@/lib/services/api-client"
import { expensesQueryKey, getExpenseQueryOptions, updateExpense } from "@/lib/services/expenses"
import { toExpenseForm, toExpenseInput, type ExpenseFormValues } from "@/lib/validations/expenses"

interface EditExpenseProps {
  expenseId: string
}

const EditExpense: FC<EditExpenseProps> = ({ expenseId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: expense, isLoading, error, refetch } = useQuery(getExpenseQueryOptions(expenseId))

  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => updateExpense(expenseId, toExpenseInput(values, expense)),
    onSuccess: async () => {
      // The update answers without names; refetch the list and the detail.
      await queryClient.invalidateQueries({ queryKey: expensesQueryKey })
      await navigate({ to: "/expenses/$expenseId", params: { expenseId } })
    },
  })

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
                <BreadcrumbLink asChild>
                  <Link to="/expenses/$expenseId" params={{ expenseId }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {expense.description}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Expense</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <ExpenseForm
          defaultValues={toExpenseForm(expense)}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/expenses/$expenseId", params: { expenseId } }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditExpense
