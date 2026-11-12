import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft, ArrowUpRight, CalendarDays, MessageSquare, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TemplatesTab from "@/features/communications/templates/templates-tab"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import { CommunicationTypeBadge, DirectionLabel } from "@/features/communications/components/communication-badges"
import { formatMoment } from "@/lib/utils/format"
import { COMMUNICATION_TYPES, getAllCommunicationsQueryOptions } from "@/lib/services/communications"

export default function CommunicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const { tab = "history" } = useSearch({ from: "/_authenticated/renters/communications/" })
  const navigate = useNavigate()

  const { data: communications = [], isLoading, error, refetch } = useQuery(getAllCommunicationsQueryOptions)

  const search = searchTerm.toLowerCase()
  const filtered = communications.filter((c) => {
    const matchesSearch = [c.subject, c.message, c.renterName, c.propertyName].some((text) => (text ?? "").toLowerCase().includes(search))
    return matchesSearch && (typeFilter === "all" || c.type === typeFilter)
  })

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const stats = [
    { title: "Logged", value: communications.length, note: "All communications", icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
    { title: "This Month", value: communications.filter((c) => new Date(c.sentAt) >= monthStart).length, note: "Since the 1st", icon: <CalendarDays className="h-4 w-4 text-muted-foreground" /> },
    { title: "Outbound", value: communications.filter((c) => c.direction === "outbound").length, note: "Sent to renters", icon: <ArrowUpRight className="h-4 w-4 text-blue-600" /> },
    { title: "Inbound", value: communications.filter((c) => c.direction === "inbound").length, note: "Received from renters", icon: <ArrowDownLeft className="h-4 w-4 text-green-600" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            </div>
            <Button asChild>
              <Link to="/renters/communications/log">
                <Plus className="h-4 w-4 mr-2" />
                Log Communication
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={tab} onValueChange={(value) => navigate({ to: "/renters/communications", search: { tab: value as "history" | "templates" } })}>
        <TabsList className="mb-6">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="history">
        {error && !communications.length && <LoadErrorState message="Failed to load communications." onRetry={() => refetch()} />}

        {isLoading && <LoadingState>Loading communications...</LoadingState>}

        {!isLoading && !(error && !communications.length) && (
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
                      placeholder="Search by renter, property, subject or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48" aria-label="Filter by type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {COMMUNICATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filtered.length > 0 && (
              <Card>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Renter</TableHead>
                        <TableHead>Subject</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="whitespace-nowrap">
                            <Link to="/renters/communications/$communicationId" params={{ communicationId: c.id }} className="text-blue-600 hover:underline">
                              {formatMoment(c.sentAt)}
                            </Link>
                          </TableCell>
                          <TableCell><CommunicationTypeBadge type={c.type} /></TableCell>
                          <TableCell><DirectionLabel direction={c.direction} /></TableCell>
                          <TableCell>{c.renterName ?? "—"}</TableCell>
                          <TableCell className="max-w-md truncate">{c.subject ?? c.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || typeFilter !== "all" ? "Try adjusting your search or filters" : "Keep a record of calls, emails and messages with your renters"}
                </p>
                {!searchTerm && typeFilter === "all" && (
                  <Button asChild>
                    <Link to="/renters/communications/log">
                      <Plus className="h-4 w-4 mr-2" />
                      Log Communication
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
        </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
