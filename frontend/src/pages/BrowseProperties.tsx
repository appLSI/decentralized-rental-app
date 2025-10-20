import { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  ChevronUp,
  ChevronDown,
  X,
  Star,
  Heart,
  Calendar,
  Users,
  Phone,
  Mail
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Mock data
const mockProperties = [
  {
    id: 1,
    title: "Luxury Downtown Apartment",
    description: "Beautiful modern apartment in the heart of the city with stunning skyline views.",
    location: "Manhattan, New York",
    rentPrice: "2.5",
    category: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "1200 sq ft",
    amenities: ["wifi", "parking", "gym", "concierge"],
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    isRented: false,
    rating: 4.8,
    reviews: 24,
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 2,
    title: "Modern Studio with Garden",
    description: "Cozy studio apartment with private garden access and modern amenities.",
    location: "Brooklyn, New York",
    rentPrice: "1.8",
    category: "studio",
    bedrooms: 1,
    bathrooms: 1,
    area: "800 sq ft",
    amenities: ["wifi", "garden", "heating", "washing machine"],
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    isRented: false,
    rating: 4.6,
    reviews: 18,
    coordinates: { lat: 40.6782, lng: -73.9442 }
  },
  {
    id: 3,
    title: "Waterfront Penthouse",
    description: "Exclusive penthouse with panoramic water views and premium finishes.",
    location: "Jersey City, New Jersey",
    rentPrice: "4.2",
    category: "penthouse",
    bedrooms: 3,
    bathrooms: 3,
    area: "2500 sq ft",
    amenities: ["wifi", "parking", "pool", "gym", "balcony", "concierge"],
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
    isRented: false,
    rating: 4.9,
    reviews: 31,
    coordinates: { lat: 40.7178, lng: -74.0431 }
  },
  {
    id: 4,
    title: "Artist Loft in SoHo",
    description: "Spacious loft perfect for artists with high ceilings and natural light.",
    location: "SoHo, New York",
    rentPrice: "3.1",
    category: "loft",
    bedrooms: 2,
    bathrooms: 1,
    area: "1800 sq ft",
    amenities: ["wifi", "heating", "fireplace", "air conditioning"],
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
    isRented: false,
    rating: 4.7,
    reviews: 22,
    coordinates: { lat: 40.7231, lng: -74.0026 }
  },
  {
    id: 5,
    title: "Cozy Family House",
    description: "Perfect family home with backyard and quiet neighborhood setting.",
    location: "Queens, New York",
    rentPrice: "2.8",
    category: "house",
    bedrooms: 4,
    bathrooms: 2,
    area: "2200 sq ft",
    amenities: ["wifi", "parking", "garden", "washing machine", "dishwasher"],
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
    isRented: false,
    rating: 4.5,
    reviews: 16,
    coordinates: { lat: 40.7282, lng: -73.7949 }
  }
];

const PROPERTY_CATEGORIES = ["apartment", "studio", "penthouse", "loft", "house"];

// Enhanced OpenStreetMap Component with animations and property cards
function OpenStreetMap({ 
  selectedProperty, 
  onPropertySelect, 
  currentPropertyIndex = 0,
  properties = [],
  onPropertyClick
}) {
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060, zoom: 13 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPropertyCard, setShowPropertyCard] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('idle');

  // Animation sequence when property changes
  useEffect(() => {
    if (properties.length > 0 && properties[currentPropertyIndex]) {
      const targetProperty = properties[currentPropertyIndex];
      if (!targetProperty.coordinates) return;

      setIsAnimating(true);
      setAnimationPhase('zoomOut');
      
      // Phase 1: Zoom out
      setTimeout(() => {
        setCoordinates(prev => ({
          ...prev,
          zoom: 10
        }));
        setAnimationPhase('move');
      }, 200);

      // Phase 2: Move to new location
      setTimeout(() => {
        setCoordinates(prev => ({
          lat: targetProperty.coordinates.lat,
          lng: targetProperty.coordinates.lng,
          zoom: 10
        }));
        setAnimationPhase('zoomIn');
      }, 800);

      // Phase 3: Zoom in
      setTimeout(() => {
        setCoordinates(prev => ({
          ...prev,
          zoom: 15
        }));
        setAnimationPhase('idle');
        setIsAnimating(false);
        
        // Show property card after animation
        setSelectedPropertyDetails(targetProperty);
        setShowPropertyCard(true);
      }, 1400);
    }
  }, [currentPropertyIndex, properties]);

  const getMapUrl = () => {
    const bbox = [
      coordinates.lng - 0.01, 
      coordinates.lat - 0.01, 
      coordinates.lng + 0.01, 
      coordinates.lat + 0.01  
    ].join(',');
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`;
  };

  const handleMarkerClick = (property, index) => {
    setSelectedPropertyDetails(property);
    setShowPropertyCard(true);
    onPropertySelect?.(property.id);
    onPropertyClick?.(index);
  };

  // Simplified Property Card - Only image and location
  const PropertyCard = ({ property, onClose }) => (
    <div className="absolute top-4 left-4 right-4 bg-card rounded-lg shadow-lg border z-10 max-w-sm animate-in slide-in-from-top-2 duration-300">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background/90 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        
        <div className="p-3">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {property.title}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col rounded-xl overflow-hidden border relative transition-all duration-500 ${
      isAnimating ? 'scale-98' : 'scale-100'
    }`}>
      {/* Animation overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-black/20 z-20 flex items-center justify-center">
          <div className="glass rounded-lg p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-sm text-foreground">
              {animationPhase === 'zoomOut' && 'Zooming out...'}
              {animationPhase === 'move' && 'Moving to property...'}
              {animationPhase === 'zoomIn' && 'Zooming in...'}
            </div>
          </div>
        </div>
      )}

      {/* Simplified Property card overlay */}
      {showPropertyCard && selectedPropertyDetails && (
        <PropertyCard 
          property={selectedPropertyDetails} 
          onClose={() => setShowPropertyCard(false)}
        />
      )}

      {/* Map container */}
      <div className="flex-1 relative">
        <iframe
          key={`${coordinates.lat}-${coordinates.lng}-${coordinates.zoom}`}
          src={getMapUrl()}
          className={`w-full h-full border-0 transition-all duration-1000 ${
            isAnimating ? 'opacity-70' : 'opacity-100'
          }`}
          title="Property Map"
          loading="lazy"
          style={{ cursor: 'default' }}
        />
        
        {/* Custom markers overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {properties.map((property, index) => {
            if (!property.coordinates) return null;
            
            // Calculate marker position
            const isVisible = Math.abs(property.coordinates.lat - coordinates.lat) < 0.02 && 
                            Math.abs(property.coordinates.lng - coordinates.lng) < 0.02;
            
            if (!isVisible) return null;
            
            const x = ((property.coordinates.lng - (coordinates.lng - 0.01)) / 0.02) * 100;
            const y = ((coordinates.lat + 0.01 - property.coordinates.lat) / 0.02) * 100;
            
            return (
              <button
                key={property.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-300 ${
                  index === currentPropertyIndex 
                    ? 'scale-125 z-10' 
                    : 'scale-100 hover:scale-110'
                }`}
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  cursor: 'pointer'
                }}
                onClick={() => handleMarkerClick(property, index)}
              >
                <div className={`w-8 h-8 rounded-full border-3 border-background shadow-lg flex items-center justify-center text-primary-foreground text-xs font-bold ${
                  index === currentPropertyIndex 
                    ? 'bg-primary ring-4 ring-primary/20 shadow-glow' 
                    : 'bg-primary hover:bg-primary-glow'
                }`}>
                  {property.rentPrice.split('.')[0]}
                </div>
                {index === currentPropertyIndex && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground/80 text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                    {property.title.split(' ').slice(0, 2).join(' ')}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map controls */}
      <div className="bg-muted p-3 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Powered by OpenStreetMap</span>
            {isAnimating && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs">Navigating...</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCoordinates(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }))}
              className="px-3 py-1 bg-background border rounded hover:bg-muted transition-colors"
              disabled={isAnimating}
            >
              Zoom +
            </button>
            <button
              onClick={() => setCoordinates(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 10) }))}
              className="px-3 py-1 bg-background border rounded hover:bg-muted transition-colors"
              disabled={isAnimating}
            >
              Zoom -
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function BrowseProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const propertyRefs = useRef([]);

  const filteredProperties = mockProperties.filter((property) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      property.title.toLowerCase().includes(searchLower) ||
      property.description.toLowerCase().includes(searchLower) ||
      property.location?.toLowerCase().includes(searchLower);

    const matchesCategory =
      categoryFilter === "all" || property.category === categoryFilter;

    const price = parseFloat(property.rentPrice);
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && price < 1) ||
      (priceFilter === "medium" && price >= 1 && price < 3) ||
      (priceFilter === "high" && price >= 3);

    return matchesSearch && matchesCategory && matchesPrice && !property.isRented;
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      for (let i = 0; i < propertyRefs.current.length; i++) {
        const propertyEl = propertyRefs.current[i];
        if (propertyEl) {
          const propertyRect = propertyEl.getBoundingClientRect();
          if (propertyRect.top <= containerCenter && propertyRect.bottom >= containerCenter) {
            setCurrentPropertyIndex(i);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [filteredProperties.length]);

  const scrollToProperty = (index) => {
    if (scrollContainerRef.current && propertyRefs.current[index]) {
      const propertyEl = propertyRefs.current[index];
      const container = scrollContainerRef.current;

      if (propertyEl) {
        const propertyRect = propertyEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;

        const propertyTop = propertyRect.top + scrollTop - containerRect.top;
        const targetScroll = propertyTop - (containerRect.height / 2) + (propertyRect.height / 2);

        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });

        setCurrentPropertyIndex(index);
      }
    }
  };

  const handlePropertySelect = (propertyId) => {
    const index = filteredProperties.findIndex(prop => prop.id === propertyId);
    if (index !== -1) {
      scrollToProperty(index);
    }
  };

  const handlePropertyClickFromMap = (index) => {
    setCurrentPropertyIndex(index);
    scrollToProperty(index);
  };

  const handlePropertyClickFromList = (index) => {
    setCurrentPropertyIndex(index);
    scrollToProperty(index);
  };

  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      wifi: <Wifi className="h-3 w-3" />,
      parking: <Car className="h-3 w-3" />,
      pool: <Waves className="h-3 w-3" />,
      gym: <Dumbbell className="h-3 w-3" />,
      balcony: <Square className="h-3 w-3" />,
      garden: <Waves className="h-3 w-3" />,
    };
    return amenityIcons[amenity.toLowerCase()] || null;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Navbar />

      {/* Header Section */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4 bg-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Browse Properties</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredProperties.length} properties available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const newIndex = Math.max(currentPropertyIndex - 1, 0);
                  setCurrentPropertyIndex(newIndex);
                  scrollToProperty(newIndex);
                }}
                disabled={currentPropertyIndex === 0}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={() => {
                  const newIndex = Math.min(currentPropertyIndex + 1, filteredProperties.length - 1);
                  setCurrentPropertyIndex(newIndex);
                  scrollToProperty(newIndex);
                }}
                disabled={currentPropertyIndex === filteredProperties.length - 1}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search properties, locations, amenities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-11 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 px-4 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
          >
            <option value="all">All Categories</option>
            {PROPERTY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="h-11 px-4 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
          >
            <option value="all">All Prices</option>
            <option value="low">Under 1 ETH</option>
            <option value="medium">1-3 ETH</option>
            <option value="high">3+ ETH</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <div className="h-full bg-card rounded-xl shadow-sm border overflow-hidden">
          {filteredProperties.length > 0 ? (
            <div className="h-full flex gap-6 p-6">
              {/* Properties List */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-none"
                >
                  {filteredProperties.map((property, index) => (
                    <div
                      key={property.id}
                      ref={(el) => (propertyRefs.current[index] = el)}
                      className={`transition-all duration-300 cursor-pointer ${
                        index === currentPropertyIndex ? "ring-2 ring-primary/30 shadow-lg" : ""
                      }`}
                      onClick={() => handlePropertyClickFromList(index)}
                    >
                      <div className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 rounded-lg bg-card">
                        <div className="flex h-full overflow-hidden">
                          <div className="w-60 flex-shrink-0 relative overflow-hidden">
                            <img
                              src={property.imageUrl}
                              alt={property.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-primary-foreground text-xs px-2 py-1 rounded">
                              Available
                            </div>
                          </div>

                          <div className="flex-1 p-4 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold truncate text-foreground">
                                    {property.title}
                                  </h3>
                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="truncate">{property.location}</span>
                                  </div>
                                </div>
                                <div className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                  {property.category}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {property.description}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                {property.bedrooms && (
                                  <div className="flex items-center">
                                    <Bed className="h-4 w-4 mr-1" />
                                    {property.bedrooms} bed
                                  </div>
                                )}
                                {property.bathrooms && (
                                  <div className="flex items-center">
                                    <Bath className="h-4 w-4 mr-1" />
                                    {property.bathrooms} bath
                                  </div>
                                )}
                                {property.area && (
                                  <div className="flex items-center">
                                    <Square className="h-4 w-4 mr-1" />
                                    {property.area}
                                  </div>
                                )}
                              </div>

                              {property.amenities?.length > 0 && (
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  {property.amenities.slice(0, 4).map((amenity) => (
                                    <div
                                      key={amenity}
                                      className="flex items-center space-x-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                                    >
                                      {getAmenityIcon(amenity)}
                                      <span>{amenity}</span>
                                    </div>
                                  ))}
                                  {property.amenities.length > 4 && (
                                    <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                      +{property.amenities.length - 4} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
                              <div>
                                <div className="text-xl font-bold text-primary">
                                  {property.rentPrice} ETH
                                </div>
                                <div className="text-sm text-muted-foreground">per month</div>
                              </div>
                              <button className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                                Rent Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Map Component */}
              <div className="w-1/2 flex-shrink-0">
                <OpenStreetMap 
                  selectedProperty={filteredProperties[currentPropertyIndex]?.id}
                  onPropertySelect={handlePropertySelect}
                  onPropertyClick={handlePropertyClickFromMap}
                  currentPropertyIndex={currentPropertyIndex}
                  properties={filteredProperties}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">No properties found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search criteria or check back later for new listings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}