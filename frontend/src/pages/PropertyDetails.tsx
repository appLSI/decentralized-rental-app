import { useState } from "react";
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  User,
  Calendar,
  Shield,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { mockProperties } from "@/lib/constants";
// Move mockProperties here temporarily if there are import issues

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Find the property by ID
  const property = mockProperties.find(
    (prop) => prop.id === parseInt(id || "")
  );

  if (!property) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Property Not Found
            </h2>
            <button
              onClick={() => navigate("/browse")}
              className="bg-[#edbf6d] text-[#1b2e3f] px-6 py-3 rounded-xl font-semibold hover:bg-[#edbf6d]/90 transition-colors"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sample additional images for the property
  const propertyImages = [
    property.imageUrl,
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
  ];

  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      wifi: <Wifi className="h-5 w-5" />,
      parking: <Car className="h-5 w-5" />,
      pool: <Waves className="h-5 w-5" />,
      gym: <Dumbbell className="h-5 w-5" />,
      garden: <Waves className="h-5 w-5" />,
      concierge: <User className="h-5 w-5" />,
      heating: <CheckCircle className="h-5 w-5" />,
      "washing machine": <CheckCircle className="h-5 w-5" />,
      "air conditioning": <CheckCircle className="h-5 w-5" />,
      fireplace: <CheckCircle className="h-5 w-5" />,
      dishwasher: <CheckCircle className="h-5 w-5" />,
      balcony: <CheckCircle className="h-5 w-5" />,
    };
    return (
      amenityIcons[amenity.toLowerCase()] || <CheckCircle className="h-5 w-5" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-8 pt-6">
        <button
          onClick={() => navigate("/browse")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-7 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-2 lg:row-span-2">
            <img
              src={propertyImages[selectedImage]}
              alt={property.title}
              className="w-full h-96 lg:h-full object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Thumbnail Images */}
          {propertyImages.slice(1, 5).map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`${property.title} ${index + 2}`}
                className={`w-full h-full object-cover rounded-xl cursor-pointer transition-all ${
                  selectedImage === index + 1
                    ? "ring-2 ring-[#edbf6d]"
                    : "hover:opacity-90"
                }`}
                onClick={() => setSelectedImage(index + 1)}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-full transition-colors ${
                      isFavorite
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Rating and Category */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-[#edbf6d] text-[#edbf6d]" />
                    <span className="font-semibold text-gray-900">
                      {property.rating}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    ({property.reviews} reviews)
                  </span>
                </div>
                <div className="bg-[#edbf6d] text-[#1b2e3f] px-3 py-1 rounded-full text-sm font-semibold">
                  {property.category}
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
                {property.bedrooms > 0 && (
                  <div className="text-center">
                    <Bed className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">
                      {property.bedrooms}
                    </div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center">
                    <Bath className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">
                      {property.bathrooms}
                    </div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center">
                    <Square className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">
                      {property.area}
                    </div>
                    <div className="text-sm text-gray-500">Area</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  About this property
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Amenities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3">
                    <div className="text-[#edbf6d]">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-gray-700 capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Property Owner
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1b2e3f] rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-[#edbf6d]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Alex Johnson</h4>
                  <p className="text-gray-600">Property Owner</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 fill-[#edbf6d] text-[#edbf6d]" />
                    <span className="text-sm text-gray-600">
                      4.9 • 42 reviews
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Identity verified
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-4 w-4 text-green-500" />
                  Super Owner
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 ">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#1b2e3f] mb-2">
                  {property.rentPrice} ETH
                </div>
                <div className="text-gray-600">per month</div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move-in Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Duration
                  </label>
                  <select className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d]">
                    <option>6 months</option>
                    <option>12 months</option>
                    <option>24 months</option>
                  </select>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly rent</span>
                  <span>{property.rentPrice} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span>0.1 ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security deposit</span>
                  <span>0.5 ETH</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {(parseFloat(property.rentPrice) + 0.1 + 0.5).toFixed(1)}{" "}
                      ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-[#edbf6d] text-[#1b2e3f] py-4 rounded-xl font-semibold hover:bg-[#edbf6d]/90 transition-colors shadow-md">
                  Rent Now
                </button>
                <button className="w-full border border-[#1b2e3f] text-[#1b2e3f] py-4 rounded-xl font-semibold hover:bg-[#1b2e3f] hover:text-white transition-colors">
                  Contact Owner
                </button>
              </div>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure blockchain transaction</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Smart contract protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
