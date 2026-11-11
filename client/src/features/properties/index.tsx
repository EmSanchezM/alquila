import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Search, Plus, MapPin, Bed, Bath, Square } from "lucide-react"
import placeholder from "@/assets/placeholder.svg"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: properties = [], isLoading, error, refetch } = useQuery(getAllPropertiesQueryOptions);

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
            <Button asChild>
              <Link to="/properties/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between gap-4">
            <p className="text-red-800">Failed to load properties.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">Loading properties...</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
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
                      src={placeholder}
                      alt={property.name}
                      className="w-full h-full object-cover"
                      width={300}
                      height={200}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      {property.address}, {property.city}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-1">
                        <Bed className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{property.bedrooms ?? "—"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Bath className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{property.bathrooms ?? "—"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Square className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{property.squareMeters ? `${Number(property.squareMeters)}m²` : "—"}</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/properties/$propertyId" params={{ propertyId: property.id }}>
                        View Details
                      </Link>
                    </Button>
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
                {!searchTerm && (
                  <Button asChild>
                    <Link to="/properties/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
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
