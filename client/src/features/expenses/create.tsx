import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import ExpenseForm from "@/features/expenses/components/expense-form"
import { createExpense, expensesQueryKey } from "@/lib/services/expenses"
import { today } from "@/lib/utils/format"
import { emptyExpenseForm, toExpenseInput, type ExpenseFormValues } from "@/lib/validations/expenses"

const CreateExpense = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { propertyId } = useSearch({ from: "/_authenticated/expenses/create" })

  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => createExpense(toExpenseInput(values)),
    onSuccess: async (expense) => {
      await queryClient.invalidateQueries({ queryKey: expensesQueryKey, exact: true })
      await navigate({ to: "/expenses/$expenseId", params: { expenseId: expense.id } })
    },
  })

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
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Add expense</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Add Expense</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Record a cost of one of your properties, or a general expense of your rental business.
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <ExpenseForm
          defaultValues={{ ...emptyExpenseForm(today()), ...(propertyId && { propertyId }) }}
          submitLabel="Add expense"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/expenses" }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default CreateExpense
