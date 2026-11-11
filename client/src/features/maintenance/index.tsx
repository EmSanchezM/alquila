import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle, Clock, Plus, Search, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from "@/features/maintenance/components/maintenance-badges"
import { getAllMaintenanceRequestsQueryOptions, MAINTENANCE_CATEGORIES, MAINTENANCE_STATUSES } from "@/lib/services/maintenance"
import { labelOf } from "@/lib/utils/options"
import { formatDay } from "@/lib/utils/format"

const isActive = (status: string) => status === "open" || status === "in_progress"

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: requests = [], isLoading, error, refetch } = useQuery(getAllMaintenanceRequestsQueryOptions)

  const search = searchTerm.toLowerCase()
  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(search) ||
        request.propertyName.toLowerCase().includes(search) ||
        (request.assignedTo ?? "").toLowerCase().includes(search)
      return matchesSearch && (statusFilter === "all" || request.status === statusFilter)
    })
    .sort((a, b) => b.reportedDate.localeCompare(a.reportedDate))

  const count = (predicate: (status: string, priority: string) => boolean) =>
    requests.filter((r) => predicate(r.status, r.priority)).length

  const stats = [
    { title: "Open", value: count((s) => s === "open"), note: "Waiting to be handled", icon: <Wrench className="h-4 w-4 text-orange-500" /> },
    { title: "In Progress", value: count((s) => s === "in_progress"), note: "Being worked on", icon: <Clock className="h-4 w-4 text-blue-500" /> },
    { title: "Urgent", value: count((s, p) => isActive(s) && p === "urgent"), note: "Open or in progress", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
    { title: "Completed", value: count((s) => s === "completed" || s === "closed"), note: "Completed or closed", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
            </div>
            <Button asChild>
              <Link to="/maintenance/create">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <LoadErrorState message="Failed to load maintenance requests." onRetry={() => refetch()} />}

        {isLoading && <LoadingState>Loading maintenance requests...</LoadingState>}

        {!isLoading && !error && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                      placeholder="Search by title, property or assignee..."
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
                      {MAINTENANCE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredRequests.length > 0 && (
              <Card>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead>Assigned to</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            <Link to="/maintenance/$requestId" params={{ requestId: request.id }} className="text-blue-600 hover:underline">
                              {request.title}
                            </Link>
                          </TableCell>
                          <TableCell>{request.propertyName}</TableCell>
                          <TableCell>{labelOf(MAINTENANCE_CATEGORIES, request.category)}</TableCell>
                          <TableCell><MaintenancePriorityBadge priority={request.priority} /></TableCell>
                          <TableCell><MaintenanceStatusBadge status={request.status} /></TableCell>
                          <TableCell className="whitespace-nowrap">{formatDay(request.reportedDate.slice(0, 10))}</TableCell>
                          <TableCell>{request.assignedTo ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Log the first issue reported in one of your properties"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild>
                    <Link to="/maintenance/create">
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
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
