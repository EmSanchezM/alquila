import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, CalendarClock, FileText, Plus, Search, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import ExpirationBadge from "@/features/documents/components/expiration-badge"
import { DOCUMENT_TYPES, expirationStatus, getAllDocumentsQueryOptions, linkedToOf, tagsOf } from "@/lib/services/documents"
import { formatFileSize } from "@/lib/services/files"
import { today } from "@/lib/utils/format"
import { labelOf } from "@/lib/utils/options"

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const { data: documents = [], isLoading, error, refetch } = useQuery(getAllDocumentsQueryOptions)

  const search = searchTerm.toLowerCase()
  const filteredDocuments = documents
    .filter((document) => {
      const matchesSearch =
        document.name.toLowerCase().includes(search) ||
        linkedToOf(document).toLowerCase().includes(search) ||
        tagsOf(document).some((tag) => tag.toLowerCase().includes(search))
      return matchesSearch && (typeFilter === "all" || document.type === typeFilter)
    })
    .sort((a, b) => Number(!!b.isImportant) - Number(!!a.isImportant) || b.createdAt.localeCompare(a.createdAt))

  const now = today()
  const stats = [
    { title: "Documents", value: documents.length, note: "In your account", icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
    { title: "Important", value: documents.filter((d) => d.isImportant).length, note: "Marked as important", icon: <Star className="h-4 w-4 text-yellow-500" /> },
    { title: "Expiring Soon", value: documents.filter((d) => expirationStatus(d.expirationDate, now) === "soon").length, note: "Within the next 30 days", icon: <CalendarClock className="h-4 w-4 text-orange-500" /> },
    { title: "Expired", value: documents.filter((d) => expirationStatus(d.expirationDate, now) === "expired").length, note: "Past their expiration date", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            </div>
            <Button asChild>
              <Link to="/documents/create">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && !documents.length && <LoadErrorState message="Failed to load documents." onRetry={() => refetch()} />}

        {isLoading && <LoadingState>Loading documents...</LoadingState>}

        {!isLoading && !(error && !documents.length) && (
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
                      placeholder="Search by name, link or tag..."
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
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredDocuments.length > 0 && (
              <Card>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Linked to</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {document.isImportant && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" aria-label="Important" />}
                              <Link to="/documents/$documentId" params={{ documentId: document.id }} className="text-blue-600 hover:underline">
                                {document.name}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>{labelOf(DOCUMENT_TYPES, document.type)}</TableCell>
                          <TableCell>{linkedToOf(document)}</TableCell>
                          <TableCell><ExpirationBadge expirationDate={document.expirationDate} /></TableCell>
                          <TableCell className="text-right">{formatFileSize(document.fileSize) ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || typeFilter !== "all" ? "Try adjusting your search or filters" : "Keep contracts, receipts and certificates in one place"}
                </p>
                {!searchTerm && typeFilter === "all" && (
                  <Button asChild>
                    <Link to="/documents/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
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
