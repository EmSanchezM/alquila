import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { CalendarClock, DollarSign, FileSignature, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import LeaseStatusBadge from "@/features/leases/components/lease-status-badge"
import { getAllLeasesQueryOptions, LEASE_STATUSES } from "@/lib/services/leases"
import { formatDay, formatMoney, today } from "@/lib/utils/format"

/** YYYY-MM-DD `days` after today, to find leases ending soon. */
function inDays(days: number) {
  const date = new Date(`${today()}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export default function LeasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: leases = [], isLoading, error, refetch } = useQuery(getAllLeasesQueryOptions)

  const search = searchTerm.toLowerCase()
  const filteredLeases = leases.filter((lease) => {
    const matchesSearch = lease.propertyName.toLowerCase().includes(search) || lease.renterName.toLowerCase().includes(search)
    return matchesSearch && (statusFilter === "all" || lease.status === statusFilter)
  })

  const active = leases.filter((l) => l.status === "active")
  const endingSoon = active.filter((l) => l.endDate >= today() && l.endDate <= inDays(30))

  const stats = [
    { title: "Active Leases", value: String(active.length), note: `${leases.length} in total`, icon: <FileSignature className="h-4 w-4 text-muted-foreground" /> },
    { title: "Monthly Rent", value: formatMoney(active.reduce((sum, l) => sum + Number(l.monthlyRent), 0)), note: "From active leases", icon: <DollarSign className="h-4 w-4 text-green-500" /> },
    { title: "Ending Soon", value: String(endingSoon.length), note: "Active, ending in the next 30 days", icon: <CalendarClock className="h-4 w-4 text-yellow-500" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <FileSignature className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Leases</h1>
            </div>
            <Button asChild>
              <Link to="/leases/create">
                <Plus className="h-4 w-4 mr-2" />
                New Lease
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <LoadErrorState message="Failed to load leases." onRetry={() => refetch()} />}

        {isLoading && <LoadingState>Loading leases...</LoadingState>}

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
                      placeholder="Search by property or renter..."
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
                      {LEASE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredLeases.length > 0 && (
              <Card>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Renter</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Monthly rent</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeases.map((lease) => (
                        <TableRow key={lease.id}>
                          <TableCell className="font-medium">
                            <Link to="/leases/$leaseId" params={{ leaseId: lease.id }} className="text-blue-600 hover:underline">
                              {lease.propertyName}
                            </Link>
                          </TableCell>
                          <TableCell>{lease.renterName}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDay(lease.startDate)} – {formatDay(lease.endDate)}</TableCell>
                          <TableCell className="text-right">{formatMoney(lease.monthlyRent)}</TableCell>
                          <TableCell><LeaseStatusBadge status={lease.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {filteredLeases.length === 0 && (
              <div className="text-center py-12">
                <FileSignature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leases found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create a lease to link a renter to a property"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild>
                    <Link to="/leases/create">
                      <Plus className="h-4 w-4 mr-2" />
                      New Lease
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
