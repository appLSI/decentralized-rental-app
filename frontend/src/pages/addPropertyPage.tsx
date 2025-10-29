import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, ArrowRight, ArrowLeftIcon } from "lucide-react";
import { PROPERTY_CATEGORIES, AMENITIES } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AddProperty() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rentPrice: "",
    imageUrl: "",
    category: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: [] as string[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.category || !formData.description) {
          alert("Please fill in all required fields in Basic Information");
          return false;
        }
        return true;
      case 2:
        if (!formData.rentPrice) {
          alert("Please set the rental price");
          return false;
        }
        if (parseFloat(formData.rentPrice) <= 0) {
          alert("Rent price must be greater than 0");
          return false;
        }
        return true;
      case 3:
        if (!formData.imageUrl) {
          alert("Please add at least one property image");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Property created:", formData);
      alert("Property listed successfully!");
      window.location.href = "/my-properties";
    } catch (error) {
      console.error("Failed to create property:", error);
      alert("Failed to create property. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sample image URLs for demo
  const sampleImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ];

  // Progress Steps
  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Pricing" },
    { number: 3, title: "Images" },
    { number: 4, title: "Details" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="space-y-8 p-4 md:p-6 lg:p-8 xl:p-20">
        {/* Header with Return Button */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              List Your Property
            </h1>
            <p className="text-muted-foreground">Create a new rental listing</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 md:space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-[#edbf6d] border-[#edbf6d] text-[#1b2e3f]"
                      : "border-gray-300 text-gray-300"
                  } font-semibold transition-all duration-300`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 font-medium ${
                    currentStep >= step.number
                      ? "text-[#edbf6d]"
                      : "text-gray-300"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-[#edbf6d]" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Modern Downtown Apartment"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property, its features, and what makes it special..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Downtown, City Center"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set your monthly rental price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="rentPrice">Monthly Rent *</Label>
                  <Input
                    id="rentPrice"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.0"
                    value={formData.rentPrice}
                    onChange={(e) =>
                      handleInputChange("rentPrice", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Pricing Summary */}
                {formData.rentPrice && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Pricing Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Rent:</span>
                          <span className="font-medium">
                            {formData.rentPrice} ETH
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
                <CardDescription>
                  Add photos to showcase your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Sample Images */}
                <div className="space-y-2">
                  <Label>Or choose from sample images:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sampleImages.map((url, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                          formData.imageUrl === url
                            ? "border-[#edbf6d]"
                            : "border-muted hover:border-[#edbf6d]/50"
                        }`}
                        onClick={() => handleInputChange("imageUrl", url)}
                      >
                        <img
                          src={url}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-20 md:h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label>Preview:</Label>
                    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border">
                      <img
                        src={formData.imageUrl}
                        alt="Property preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Property Details & Amenities */}
          {currentStep === 4 && (
            <div className="space-y-6 md:space-y-8">
              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <CardDescription>
                    Specify the size and layout of your property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.bedrooms}
                        onChange={(e) =>
                          handleInputChange("bedrooms", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={formData.bathrooms}
                        onChange={(e) =>
                          handleInputChange("bathrooms", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Area (sq ft)</Label>
                      <Input
                        id="area"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.area}
                        onChange={(e) =>
                          handleInputChange("area", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>
                    Select the amenities available in your property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {AMENITIES.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <Label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Précédent</span>
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d]/90 flex items-center space-x-2"
              >
                <span>Suivant</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d]/90 flex items-center space-x-2"
              >
                {isLoading ? (
                  "Creating Property..."
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>List Property</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
