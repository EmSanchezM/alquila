import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadErrorState } from "@/components/shared/resource-states"
import { EXPENSE_CATEGORIES, getAllExpensesQueryOptions } from "@/lib/services/expenses"
import { formatDay, formatMoney } from "@/lib/utils/format"
import { labelOf } from "@/lib/utils/options"

/**
 * The expenses of one property. Filters the cached expenses list instead of a dedicated
 * request: lists are per user and small.
 */
export default function ExpenseSection({ propertyId }: { propertyId: string }) {
  const { data: expenses = [], isLoading, error, refetch } = useQuery(getAllExpensesQueryOptions)

  const own = expenses
    .filter((expense) => expense.propertyId === propertyId)
    .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
  const total = own.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <section className="grid gap-3" aria-labelledby="expenses-heading">
      <div className="flex items-center justify-between gap-4">
        <h3 id="expenses-heading" className="text-lg font-semibold text-gray-900">
          Expenses {own.length > 0 && <span className="text-sm font-normal text-gray-500">· {formatMoney(total)} in total</span>}
        </h3>
        <Button variant="outline" size="sm" asChild>
          <Link to="/expenses/create" search={{ propertyId }}>
            <Plus className="h-4 w-4 mr-2" />
            Add expense
          </Link>
        </Button>
      </div>

      {error && <LoadErrorState message="Failed to load expenses." onRetry={() => refetch()} />}
      {isLoading && <p className="text-sm text-gray-500">Loading expenses...</p>}
      {!isLoading && !error && own.length === 0 && <p className="text-sm text-gray-500">No expenses yet.</p>}

      {own.length > 0 && (
        <div className="overflow-x-auto rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {own.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    <Link to="/expenses/$expenseId" params={{ expenseId: expense.id }} className="text-blue-600 hover:underline">
                      {expense.description}
                    </Link>
                  </TableCell>
                  <TableCell>{labelOf(EXPENSE_CATEGORIES, expense.category)}</TableCell>
                  <TableCell className="text-right">{formatMoney(expense.amount)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDay(expense.expenseDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
