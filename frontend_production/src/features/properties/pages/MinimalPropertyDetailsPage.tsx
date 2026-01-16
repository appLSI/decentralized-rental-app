import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Heart, Star, MapPin, Users, Bed, Bath, Home, Wifi,
    Shield, ChevronLeft, ChevronRight, X, Share2,
    Loader2, Edit, ArrowLeft, Calendar, CheckCircle
} from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls, type MapRef } from '@/components/ui/map';
import { usePropertiesStore } from '../hooks/usePropertiesStore';
import { useAdminStore } from '@/features/admin/hooks/useAdminStore';
import { formatPrice, resolveImageUrl } from '../types/properties.types';
import { Navbar } from '@/components/Layout/Navbar/Navbar';
import { PropertyIcons } from '@/constants/PropertyIcons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/auth.store';

const ImageGallery = ({ images }: { images: string[] }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <>
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[500px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                <div
                    className="col-span-2 row-span-2 cursor-pointer relative group overflow-hidden"
                    onClick={() => setShowLightbox(true)}
                >
                    <img
                        src={resolveImageUrl(images[0])}
                        alt="Main"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {images.slice(1, 5).map((img, idx) => (
                    <div
                        key={idx}
                        className="cursor-pointer relative group overflow-hidden"
                        onClick={() => {
                            setSelectedImage(idx + 1);
                            setShowLightbox(true);
                        }}
                    >
                        <img
                            src={resolveImageUrl(img)}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {idx === 3 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="text-white text-lg font-bold">+{images.length - 5}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showLightbox && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-200">
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-6 text-white p-3 hover:bg-white/10 rounded-full transition-all"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="max-w-5xl max-h-[80vh] relative px-4">
                        <img
                            src={resolveImageUrl(images[selectedImage])}
                            alt="Selected"
                            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                        />
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white/70 text-sm font-medium">
                            {selectedImage + 1} / {images.length}
                        </div>
                    </div>

                    <button
                        onClick={nextImage}
                        className="absolute right-6 text-white p-3 hover:bg-white/10 rounded-full transition-all"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
            )}
        </>
    );
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    } catch (e) {
        return '';
    }
};

export default function MinimalPropertyDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentProperty, loading, fetchPropertyById, resetCurrentProperty } = usePropertiesStore();
    const { validateProperty, rejectProperty } = useAdminStore();
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const mapRef = useRef<MapRef>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        if (id) {
            fetchPropertyById(id);
        }
        return () => resetCurrentProperty();
    }, [id, fetchPropertyById, resetCurrentProperty]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Skeleton className="h-10 w-1/2 rounded-xl" />
                    <Skeleton className="h-[500px] w-full rounded-3xl" />
                    <div className="grid grid-cols-3 gap-8">
                        <Skeleton className="h-64 col-span-2 rounded-3xl" />
                        <Skeleton className="h-64 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!currentProperty) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-gray-400 font-medium">Property not found</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full">Go Back</Button>
                </div>
            </div>
        );
    }

    const property = currentProperty;
    const displayAmenities = showAllAmenities
        ? property.characteristics
        : property.characteristics.slice(0, 8);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Actions Row */}
                <div className="flex items-center justify-between">

                    <Button
                        onClick={() => navigate(-1)}
                        variant="ghost"
                        className="rounded-full px-4 h-10 font-bold text-gray-600 hover:text-black hover:bg-white gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    {!user?.roles?.includes("ADMIN") && (
                        <Button
                            onClick={() => navigate(`/host/properties/${property.propertyId}`)}
                            className="rounded-full px-8 h-12 bg-black hover:bg-gray-800 text-white font-bold shadow-lg transition-all gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Listing
                        </Button>
                    )}

                    {(user?.roles?.includes("ADMIN") || user?.roles?.includes("AGENT")) && property.status === "PENDING" && (
                        <div className="flex gap-3">
                            <Button
                                onClick={async () => {
                                    if (window.confirm("Approve this property?")) {
                                        await validateProperty(property.propertyId);
                                        navigate('/admin/properties');
                                    }
                                }}
                                className="rounded-full px-8 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg transition-all gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                            </Button>
                            <Button
                                onClick={async () => {
                                    const reason = window.prompt("Reason for rejection:");
                                    if (reason) {
                                        await rejectProperty(property.propertyId, { reason });
                                        navigate('/admin/properties');
                                    }
                                }}
                                variant="outline"
                                className="rounded-full px-8 h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold shadow-sm transition-all gap-2"
                            >
                                <X className="w-4 h-4" />
                                Reject
                            </Button>
                        </div>
                    )}

                </div>

                {/* Header Section */}
                <div className="space-y-3 px-2">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        {property.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-500 font-medium h-6">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{property.city}, {property.country}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span className="text-gray-900 font-semibold">Verified Listing</span>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                <ImageGallery images={property.imageFolderPath || []} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Specs & Description Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
                            <div className="flex flex-wrap gap-x-8 gap-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Type</p>
                                    <p className="font-semibold text-gray-900">{property.type}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Guests</p>
                                    <p className="font-semibold text-gray-900">{property.nbOfGuests}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bedrooms</p>
                                    <p className="font-semibold text-gray-900">{property.nbOfBedrooms}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Beds</p>
                                    <p className="font-semibold text-gray-900">{property.nbOfBeds}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Baths</p>
                                    <p className="font-semibold text-gray-900">{property.nbOfBathrooms}</p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-50" />

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">About this space</h2>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {property.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-gray-500 pt-2">
                                <Calendar className="w-4 h-4" />
                                <span>Member since {formatDate(property.createdAt)}</span>
                            </div>
                        </div>

                        {/* Amenities Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">What this place offers</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {displayAmenities.map((amenity) => {
                                    const Icon = PropertyIcons[amenity.name] || Home;
                                    return (
                                        <div key={amenity.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                            <Icon className="w-5 h-5 text-gray-800" />
                                            <span className="font-semibold text-gray-900">{amenity.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {property.characteristics.length > 8 && (
                                <Button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl font-bold text-sm mt-2"
                                >
                                    {showAllAmenities ? 'Show less' : `Show all ${property.characteristics.length} amenities`}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Map Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Location</h2>
                            <div className="space-y-4">
                                <div className="text-gray-600 font-medium">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Area</p>
                                    <p className="text-gray-900">{property.addressName}, {property.city}</p>
                                </div>
                                <div className="h-80 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
                                    <Map
                                        ref={mapRef}
                                        center={[property.longitude, property.latitude]}
                                        zoom={14}
                                    >
                                        <MapMarker
                                            longitude={property.longitude}
                                            latitude={property.latitude}
                                        >
                                            <MarkerContent>
                                                <div className="p-2 bg-black rounded-full shadow-xl text-white border-2 border-white flex items-center justify-center">
                                                    <Home className="w-4 h-4" />
                                                </div>
                                            </MarkerContent>
                                        </MapMarker>
                                        <MapControls showZoom showLocate showFullscreen />
                                    </Map>
                                </div>
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="bg-gray-900 rounded-3xl p-8 shadow-lg text-white space-y-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-emerald-400" />
                                <h3 className="font-bold text-lg">Safe Booking</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                Your stay is guaranteed by our blockchain-powered security. Funds are released only after checking in.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
