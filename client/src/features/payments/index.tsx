import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, CheckCircle, Clock, HandCoins, Plus, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import PaymentStatusBadge from "@/features/payments/components/payment-status-badge"
import { getAllPaymentsQueryOptions, PAYMENT_STATUSES, paymentMethodLabel, type PaymentWithNames } from "@/lib/services/payments"
import { formatDay, formatMoney } from "@/lib/utils/format"

const sum = (payments: PaymentWithNames[]) => payments.reduce((total, p) => total + Number(p.amount), 0)

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: payments = [], isLoading, error, refetch } = useQuery(getAllPaymentsQueryOptions)

  const search = searchTerm.toLowerCase()
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.propertyName.toLowerCase().includes(search) ||
        payment.renterName.toLowerCase().includes(search) ||
        (payment.reference ?? "").toLowerCase().includes(search)
      return matchesSearch && (statusFilter === "all" || payment.status === statusFilter)
    })
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))

  const byStatus = (status: string) => payments.filter((p) => p.status === status)

  const stats = [
    { title: "Collected", value: formatMoney(sum(byStatus("paid"))), note: `${byStatus("paid").length} paid`, icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: "text-green-600" },
    { title: "Pending", value: formatMoney(sum(byStatus("pending"))), note: `${byStatus("pending").length} pending`, icon: <Clock className="h-4 w-4 text-yellow-500" />, color: "text-yellow-600" },
    { title: "Overdue", value: formatMoney(sum(byStatus("overdue"))), note: `${byStatus("overdue").length} overdue`, icon: <AlertCircle className="h-4 w-4 text-red-500" />, color: "text-red-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <HandCoins className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link to="/payments/automation">
                  <Settings className="h-4 w-4 mr-2" />
                  Automation
                </Link>
              </Button>
              <Button asChild>
                <Link to="/payments/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <LoadErrorState message="Failed to load payments." onRetry={() => refetch()} />}

        {isLoading && <LoadingState>Loading payments...</LoadingState>}

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
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
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
                      placeholder="Search by property, renter or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {PAYMENT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredPayments.length > 0 && (
              <Card>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Renter</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            <Link to="/payments/$paymentId" params={{ paymentId: payment.id }} className="text-blue-600 hover:underline">
                              {payment.renterName}
                            </Link>
                          </TableCell>
                          <TableCell>{payment.propertyName}</TableCell>
                          <TableCell className="text-right">{formatMoney(payment.amount)}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDay(payment.dueDate)}</TableCell>
                          <TableCell className="whitespace-nowrap">{payment.paidDate ? formatDay(payment.paidDate) : "—"}</TableCell>
                          <TableCell>{paymentMethodLabel(payment.paymentMethod) ?? "—"}</TableCell>
                          <TableCell><PaymentStatusBadge status={payment.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <HandCoins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Record the first payment of a lease"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild>
                    <Link to="/payments/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Record Payment
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
