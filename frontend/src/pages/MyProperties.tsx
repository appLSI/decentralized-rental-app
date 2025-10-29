import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  MapPin,
  DollarSign,
  User,
  Plus,
  Eye,
  CreditCard as Edit,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Mock data
const mockOwnedProperties = [
  {
    id: 1,
    title: "Modern Apartment in Manhattan",
    description:
      "Beautiful modern apartment in the heart of Manhattan with stunning city views.",
    location: "New York, NY",
    category: "Apartment",
    rentPrice: "2.5",
    imageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    bedrooms: 2,
    bathrooms: 2,
    area: "1200",
    isRented: true,
    tenant: "0x742d35Cc...4E89",
    rentDueDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
  },
  {
    id: 2,
    title: "Luxury Villa",
    description: "Spacious villa with private pool and beautiful garden.",
    location: "Los Angeles, CA",
    category: "Villa",
    rentPrice: "5.0",
    imageUrl:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    bedrooms: 4,
    bathrooms: 3,
    area: "2800",
    isRented: false,
  },
  {
    id: 3,
    title: "Downtown Studio",
    description:
      "Cozy studio apartment in the city center with modern amenities.",
    location: "Chicago, IL",
    category: "Studio",
    rentPrice: "1.8",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    bedrooms: 1,
    bathrooms: 1,
    area: "800",
    isRented: true,
    tenant: "0x8934F3Ae...7C12",
    rentDueDate: Date.now() + 8 * 24 * 60 * 60 * 1000, // 8 days from now
  },
];

const mockRentedProperties = [
  {
    id: 4,
    title: "Beachfront Condo",
    description: "Luxury beachfront condo with panoramic ocean views.",
    location: "Miami, FL",
    category: "Condo",
    rentPrice: "4.5",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    bedrooms: 2,
    bathrooms: 2,
    area: "1500",
    owner: "0x8934F3Ae...7C12",
    rentDueDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
  },
];

export default function MyPropertiesPage() {
  const [ownedProperties] = useState(mockOwnedProperties);
  const [rentedProperties] = useState(mockRentedProperties);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDaysUntilDue = (dueDate: number) => {
    const days = Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="space-y-8 p-6 lg:p-20">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                My Properties
              </h1>
              <p className="text-gray-600">
                Manage your property portfolio and rental agreements
              </p>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = "/add-property")}
            className="bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d]/90 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            List New Property
          </Button>
        </div>

        <Tabs defaultValue="owned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="owned"
              className="data-[state=active]:bg-white data-[state=active]:text-[#1b2e3f] data-[state=active]:shadow-sm transition-all"
            >
              Properties I Own ({ownedProperties.length})
            </TabsTrigger>
            <TabsTrigger
              value="rented"
              className="data-[state=active]:bg-white data-[state=active]:text-[#1b2e3f] data-[state=active]:shadow-sm transition-all"
            >
              Properties I Rent ({rentedProperties.length})
            </TabsTrigger>
          </TabsList>

          {/* Owned Properties */}
          <TabsContent value="owned" className="space-y-6">
            {ownedProperties.length === 0 ? (
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No properties owned
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start building your real estate portfolio by listing your
                    first property.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/add-property")}
                    className="bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d]/90 font-semibold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    List Your First Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ownedProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          property.isRented
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        } border`}
                      >
                        {property.isRented ? "Rented" : "Available"}
                      </Badge>
                    </div>

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900">
                            {property.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 border-gray-200"
                        >
                          {property.category}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <CardDescription className="text-gray-600 line-clamp-2">
                        {property.description}
                      </CardDescription>

                      {/* Property Details */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>{property.bedrooms} bed</span>
                          <span>{property.bathrooms} bath</span>
                          <span>{property.area} sq ft</span>
                        </div>
                      </div>

                      {/* Rental Info */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Monthly Rent:
                          </span>
                          <span className="font-semibold text-[#1b2e3f]">
                            {property.rentPrice} ETH
                          </span>
                        </div>

                        {property.isRented && property.tenant && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Tenant:
                              </span>
                              <span className="font-mono text-sm text-gray-700">
                                {formatAddress(property.tenant)}
                              </span>
                            </div>
                            {property.rentDueDate && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Next Payment:
                                </span>
                                <span
                                  className={`text-sm font-semibold ${
                                    getDaysUntilDue(property.rentDueDate) <= 7
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {getDaysUntilDue(property.rentDueDate)} days
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rented Properties */}
          <TabsContent value="rented" className="space-y-6">
            {rentedProperties.length === 0 ? (
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No properties rented
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Browse available properties to find your perfect rental.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/browse")}
                    className="bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d]/90 font-semibold"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rentedProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 border-blue-200">
                        Your Rental
                      </Badge>
                    </div>

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900">
                            {property.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 border-gray-200"
                        >
                          {property.category}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <CardDescription className="text-gray-600 line-clamp-2">
                        {property.description}
                      </CardDescription>

                      {/* Property Details */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>{property.bedrooms} bed</span>
                          <span>{property.bathrooms} bath</span>
                          <span>{property.area} sq ft</span>
                        </div>
                      </div>

                      {/* Rental Info */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Monthly Rent:
                          </span>
                          <span className="font-semibold text-[#1b2e3f]">
                            {property.rentPrice} ETH
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Landlord:
                          </span>
                          <span className="font-mono text-sm text-gray-700">
                            {formatAddress(property.owner!)}
                          </span>
                        </div>

                        {property.rentDueDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Next Payment Due:
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                getDaysUntilDue(property.rentDueDate) <= 7
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {getDaysUntilDue(property.rentDueDate)} days
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Pay Rent
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
