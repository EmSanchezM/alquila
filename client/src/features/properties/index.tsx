import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building2, Search, Plus, MapPin, Bed, Bath, Square, DollarSign, Users, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import placeholder from "@/assets/placeholder.svg"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useQuery(getAllPropertiesQueryOptions);

  // Mock data - in real app, this would come from your database
  const properties = [
    {
      id: 1,
      name: "Sunset Apartments",
      address: "123 Main St, Downtown",
      city: "Miami",
      propertyType: "apartment",
      bedrooms: 2,
      bathrooms: 2,
      squareMeters: 85,
      monthlyRent: 1200,
      status: "occupied",
      tenant: "María García",
      images: [placeholder],
    },
    {
      id: 2,
      name: "Ocean View Condo",
      address: "456 Beach Ave, Oceanfront",
      city: "Miami",
      propertyType: "apartment",
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      monthlyRent: 1800,
      status: "vacant",
      tenant: null,
      images: [placeholder],
    },
    {
      id: 3,
      name: "Downtown Loft",
      address: "789 Urban St, City Center",
      city: "Miami",
      propertyType: "apartment",
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 65,
      monthlyRent: 1500,
      status: "maintenance",
      tenant: null,
      images: [placeholder],
    },
  ]

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "default"
      case "vacant":
        return "secondary"
      case "maintenance":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>Enter the details for your new property</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Property Name</Label>
                      <Input id="name" placeholder="Sunset Apartments" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Property Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="room">Room</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Miami" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="FL" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="33101" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input id="bedrooms" type="number" placeholder="2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input id="bathrooms" type="number" placeholder="2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sqm">Square Meters</Label>
                      <Input id="sqm" type="number" placeholder="85" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Property description..." />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>Add Property</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={property.images[0] || placeholder}
                  alt={property.name}
                  className="w-full h-full object-cover"
                  width={300}
                  height={200}
                />
                <Badge className="absolute top-2 right-2" variant={getStatusColor(property.status)}>
                  {property.status}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Square className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{property.squareMeters}m²</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">${property.monthlyRent}/month</span>
                  </div>
                  {property.tenant && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">{property.tenant}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link
                      to="/properties/$propertyId"
                      params={{
                        propertyId: property.id.toString(),
                      }}
                    >View Details</Link>
                  </Button>
                  <Button size="sm" className="flex-1">
                    {property.status === "vacant" ? "Find Tenant" : "Manage"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first property"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
