import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { Search, MapPin, Star, Heart, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProperties } from "@/lib/constants";

const PROPERTY_CATEGORIES = [
  "apartment",
  "studio",
  "penthouse",
  "loft",
  "house",
];

export default function BrowseProperties() {
  const navigate = useNavigate(); // Add this hook
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const filteredProperties = mockProperties.filter((property) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      property.title.toLowerCase().includes(searchLower) ||
      property.location?.toLowerCase().includes(searchLower);

    const matchesCategory =
      categoryFilter === "all" || property.category === categoryFilter;

    const price = parseFloat(property.rentPrice);
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && price < 1) ||
      (priceFilter === "medium" && price >= 1 && price < 3) ||
      (priceFilter === "high" && price >= 3);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort properties based on selection
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.rentPrice) - parseFloat(b.rentPrice);
      case "price-high":
        return parseFloat(b.rentPrice) - parseFloat(a.rentPrice);
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Add this function to handle property click
  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Search Section with Background Image */}
      <div
        className="relative py-16 px-8 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'linear-gradient(rgba(27, 46, 63, 0.8), rgba(27, 46, 63, 0.9)), url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover amazing properties with secure blockchain-based rentals
          </p>

          {/* Search Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location or property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-all text-lg"
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="h-14 px-6 bg-[#1b2e3f] text-white rounded-xl flex items-center gap-2 hover:bg-[#2d4458] transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                  >
                    <option value="all">All Types</option>
                    {PROPERTY_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under 1 ETH</option>
                    <option value="medium">1-3 ETH</option>
                    <option value="high">3+ ETH</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-9 text-white">
            <span className="bg-[#edbf6d] text-[#1b2e3f] px-4 py-2 rounded-full font-semibold">
              {filteredProperties.length} Properties Found
            </span>
          </div>
        </div>
      </div>

      {/* Properties Grid - Simplified */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {sortedProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => handlePropertyClick(property.id)} // Use the navigation function
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
              >
                {/* Property Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation when clicking favorite
                      // Add favorite logic here
                    }}
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Property Info - Simplified */}
                <div className="p-4">
                  {/* Name and Location */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#edbf6d] text-[#edbf6d]" />
                      <span className="text-sm font-semibold text-gray-900">
                        {property.rating}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      ({property.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-[#1b2e3f]">
                      {property.rentPrice} ETH
                    </div>
                    <span className="text-xs text-gray-500">month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your search criteria or check back later for new
              listings.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
