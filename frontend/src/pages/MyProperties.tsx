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
];

const mockRentedProperties = [
  {
    id: 3,
    title: "Beachfront Condo",
    description: "Luxury beachfront condo with panoramic ocean views.",
    location: "Miami, FL",
    category: "Condo",
    rentPrice: "4.5",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
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
    <div className="min-h-screen">
      <Navbar />
      <div className="space-y-8 p-20">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                My Properties
              </h1>
              <p className="text-muted-foreground">
                Manage your property portfolio and rental agreements
              </p>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = "/add-property")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Plus className=" h-4 w-4" />
            List New Property
          </Button>
        </div>

        <Tabs defaultValue="owned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="owned">
              Properties I Own ({ownedProperties.length})
            </TabsTrigger>
            <TabsTrigger value="rented">
              Properties I Rent ({rentedProperties.length})
            </TabsTrigger>
          </TabsList>

          {/* Owned Properties */}
          <TabsContent value="owned" className="space-y-6">
            {ownedProperties.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No properties owned
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your real estate portfolio by listing your
                    first property.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/list-property")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    List Your First Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {ownedProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          property.isRented
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {property.isRented ? "Rented" : "Available"}
                      </Badge>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {property.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location}
                          </div>
                        </div>
                        <Badge variant="secondary">{property.category}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <CardDescription className="line-clamp-2">
                        {property.description}
                      </CardDescription>

                      {/* Rental Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Monthly Rent:
                          </span>
                          <span className="font-medium">
                            {property.rentPrice} ETH
                          </span>
                        </div>

                        {property.isRented && property.tenant && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Tenant:
                              </span>
                              <span className="font-mono text-sm">
                                {formatAddress(property.tenant)}
                              </span>
                            </div>
                            {property.rentDueDate && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Next Payment:
                                </span>
                                <span
                                  className={`text-sm font-medium ${
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
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
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
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No properties rented
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Browse available properties to find your perfect rental.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/browse")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {rentedProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Your Rental
                      </Badge>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {property.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location}
                          </div>
                        </div>
                        <Badge variant="secondary">{property.category}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <CardDescription className="line-clamp-2">
                        {property.description}
                      </CardDescription>

                      {/* Rental Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Monthly Rent:
                          </span>
                          <span className="font-medium">
                            {property.rentPrice} ETH
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Landlord:
                          </span>
                          <span className="font-mono text-sm">
                            {formatAddress(property.owner!)}
                          </span>
                        </div>

                        {property.rentDueDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Next Payment Due:
                            </span>
                            <span
                              className={`text-sm font-medium ${
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
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Pay Rent
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
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
    </div>
  );
}
