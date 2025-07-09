import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from "@tanstack/react-router"
import { AlertTriangle, CheckCircle, Clock, FileText, Mail, MapPin, MessageSquare, Phone, Plus, Search, Users } from "lucide-react"

export default function RentersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Mock data - in real app, this would come from your database
  const tenants = [
    {
      id: 1,
      firstName: "María",
      lastName: "García",
      email: "maria.garcia@email.com",
      phoneNumber: "+1-555-0123",
      dniNumber: "12345678A",
      verificationStatus: "verified",
      property: "Sunset Apartments - Apt 101",
      leaseStart: "2024-01-01",
      leaseEnd: "2024-12-31",
      monthlyRent: 1200,
      emergencyContact: {
        name: "Carlos García",
        phone: "+1-555-0124",
        relationship: "Brother",
      },
      notes: "Excellent tenant, always pays on time",
      isActive: true,
      lastCommunication: "2025-01-05",
      communicationCount: 12,
    },
    {
      id: 2,
      firstName: "Carlos",
      lastName: "López",
      email: "carlos.lopez@email.com",
      phoneNumber: "+1-555-0125",
      dniNumber: "87654321B",
      verificationStatus: "pending",
      property: "Ocean View Condo - Apt 205",
      leaseStart: "2024-06-01",
      leaseEnd: "2025-05-31",
      monthlyRent: 1800,
      emergencyContact: {
        name: "Ana López",
        phone: "+1-555-0126",
        relationship: "Sister",
      },
      notes: "New tenant, verification documents pending",
      isActive: true,
      lastCommunication: "2025-01-03",
      communicationCount: 3,
    },
    {
      id: 3,
      firstName: "Ana",
      lastName: "Rodríguez",
      email: "ana.rodriguez@email.com",
      phoneNumber: "+1-555-0127",
      dniNumber: "11223344C",
      verificationStatus: "rejected",
      property: "Downtown Loft - Apt 302",
      leaseStart: "2024-03-01",
      leaseEnd: "2025-02-28",
      monthlyRent: 1500,
      emergencyContact: {
        name: "Luis Rodríguez",
        phone: "+1-555-0128",
        relationship: "Father",
      },
      notes: "Verification failed - incomplete documentation",
      isActive: false,
      lastCommunication: "2024-12-28",
      communicationCount: 8,
    },
  ]

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || tenant.verificationStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const verifiedCount = tenants.filter((t) => t.verificationStatus === "verified").length
  const pendingCount = tenants.filter((t) => t.verificationStatus === "pending").length
  const rejectedCount = tenants.filter((t) => t.verificationStatus === "rejected").length

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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Renter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Tenant</DialogTitle>
                    <DialogDescription>Enter the tenant's information and verification details</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="María" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="García" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="maria.garcia@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+1-555-0123" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dni">ID Number (DNI/Passport)</Label>
                      <Input id="dni" placeholder="12345678A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property">Property</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apt101">Sunset Apartments - Apt 101</SelectItem>
                          <SelectItem value="apt205">Ocean View Condo - Apt 205</SelectItem>
                          <SelectItem value="apt302">Downtown Loft - Apt 302</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Contact</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Contact Name" />
                        <Input placeholder="Phone Number" />
                        <Input placeholder="Relationship" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Add Tenant</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground">Active leases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
              <p className="text-xs text-muted-foreground">Verification complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Verification failed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {tenant.firstName} {tenant.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tenant.property}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVerificationIcon(tenant.verificationStatus)}
                    <Badge variant={getVerificationColor(tenant.verificationStatus)}>{tenant.verificationStatus}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tenant.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tenant.phoneNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">ID: {tenant.dniNumber}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Lease Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Start:</span> {new Date(tenant.leaseStart).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span> {new Date(tenant.leaseEnd).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-gray-500">Rent:</span> ${tenant.monthlyRent}/month
                    </div>
                    <div>
                      <span className="text-gray-500">Messages:</span> {tenant.communicationCount}
                    </div>
                  </div>
                </div>

                {tenant.emergencyContact && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Emergency Contact</h4>
                    <div className="text-sm text-gray-600">
                      {tenant.emergencyContact.name} ({tenant.emergencyContact.relationship})
                      <br />
                      {tenant.emergencyContact.phone}
                    </div>
                  </div>
                )}

                {tenant.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{tenant.notes}</p>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link 
                      to="/renters/$renterId"
                      params={{ renterId: tenant.id.toString() }}
                    >
                      View Profile
                    </Link>
                  </Button>
                  {tenant.verificationStatus === "pending" && (
                    <Button size="sm" variant="secondary">
                      Verify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first tenant"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}