import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays, Plus, Receipt, Repeat, Search, TrendingDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import { EXPENSE_CATEGORIES, getAllExpensesQueryOptions, RECURRING_FREQUENCIES, type ExpenseWithNames } from "@/lib/services/expenses"
import { formatDay, formatMoney, today } from "@/lib/utils/format"
import { labelOf } from "@/lib/utils/options"

const sum = (expenses: ExpenseWithNames[]) => expenses.reduce((total, e) => total + Number(e.amount), 0)

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const { data: expenses = [], isLoading, error, refetch } = useQuery(getAllExpensesQueryOptions)

  const search = searchTerm.toLowerCase()
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(search) ||
        (expense.vendor ?? "").toLowerCase().includes(search) ||
        (expense.propertyName ?? "").toLowerCase().includes(search)
      return matchesSearch && (categoryFilter === "all" || expense.category === categoryFilter)
    })
    .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))

  const month = today().slice(0, 7)
  const year = today().slice(0, 4)
  const recurring = expenses.filter((e) => e.isRecurring)
  const monthlyRecurring = recurring.reduce(
    (total, e) => total + Number(e.amount) / (e.recurringFrequency === "yearly" ? 12 : 1),
    0,
  )

  const stats = [
    { title: "This Month", value: formatMoney(sum(expenses.filter((e) => e.expenseDate.startsWith(month)))), note: "Expenses dated this month", icon: <CalendarDays className="h-4 w-4 text-muted-foreground" /> },
    { title: "This Year", value: formatMoney(sum(expenses.filter((e) => e.expenseDate.startsWith(year)))), note: "Expenses dated this year", icon: <TrendingDown className="h-4 w-4 text-red-500" /> },
    { title: "Recurring", value: formatMoney(monthlyRecurring), note: `Per month, from ${recurring.length} recurring`, icon: <Repeat className="h-4 w-4 text-blue-500" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Receipt className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            </div>
            <Button asChild>
              <Link to="/expenses/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <LoadErrorState message="Failed to load expenses." onRetry={() => refetch()} />}

        {isLoading && <LoadingState>Loading expenses...</LoadingState>}

        {!isLoading && !error && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by description, vendor or property..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48" aria-label="Filter by category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredExpenses.length > 0 && (
              <Card>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Vendor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Link to="/expenses/$expenseId" params={{ expenseId: expense.id }} className="text-blue-600 hover:underline">
                                {expense.description}
                              </Link>
                              {expense.isRecurring && (
                                <Badge variant="outline">{labelOf(RECURRING_FREQUENCIES, expense.recurringFrequency ?? "")}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{expense.propertyName ?? "General"}</TableCell>
                          <TableCell>{labelOf(EXPENSE_CATEGORIES, expense.category)}</TableCell>
                          <TableCell className="text-right">{formatMoney(expense.amount)}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDay(expense.expenseDate)}</TableCell>
                          <TableCell>{expense.vendor ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {filteredExpenses.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== "all" ? "Try adjusting your search or filters" : "Track what your properties cost you"}
                </p>
                {!searchTerm && categoryFilter === "all" && (
                  <Button asChild>
                    <Link to="/expenses/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
