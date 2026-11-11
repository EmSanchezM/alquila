import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle, Clock, FileText, Mail, MessageSquare, Phone, Plus, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import VerificationBadge from "@/features/renters/components/verification-badge"
import { getAllRentersQueryOptions, renterName, VERIFICATION_STATUSES } from "@/lib/services/renters"

export default function RentersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: renters = [], isLoading, error, refetch } = useQuery(getAllRentersQueryOptions)

  const search = searchTerm.toLowerCase()
  const filteredRenters = renters.filter((renter) => {
    const matchesSearch =
      renterName(renter).toLowerCase().includes(search) ||
      (renter.email ?? "").toLowerCase().includes(search) ||
      (renter.dniNumber ?? "").toLowerCase().includes(search)
    const matchesStatus = statusFilter === "all" || (renter.verificationStatus ?? "pending") === statusFilter
    return matchesSearch && matchesStatus
  })

  const countBy = (status: string) => renters.filter((r) => (r.verificationStatus ?? "pending") === status).length

  const stats = [
    { title: "Total Renters", value: renters.length, note: "In your account", icon: <Users className="h-4 w-4 text-muted-foreground" />, color: "" },
    { title: "Verified", value: countBy("verified"), note: "Verification complete", icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: "text-green-600" },
    { title: "Pending", value: countBy("pending"), note: "Awaiting verification", icon: <Clock className="h-4 w-4 text-yellow-500" />, color: "text-yellow-600" },
    { title: "Issues", value: countBy("rejected"), note: "Verification failed", icon: <AlertTriangle className="h-4 w-4 text-red-500" />, color: "text-red-600" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Renters Management</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link to="/renters/communications">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Communications
                </Link>
              </Button>
              <Button asChild>
                <Link to="/renters/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Renter
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <LoadErrorState message="Failed to load renters." onRetry={() => refetch()} />}

        {isLoading && <LoadingState>Loading renters...</LoadingState>}

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
                      placeholder="Search renters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48" aria-label="Filter by verification">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {VERIFICATION_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Renters Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRenters.map((renter) => (
                <Card key={renter.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-lg">{renterName(renter)}</CardTitle>
                      <VerificationBadge status={renter.verificationStatus} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{renter.email ?? "—"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{renter.phoneNumber ?? "—"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">ID: {renter.dniNumber ?? "—"}</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                      <Link to="/renters/$renterId" params={{ renterId: renter.id }}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRenters.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No renters found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Get started by adding your first renter"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild>
                    <Link to="/renters/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Renter
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
