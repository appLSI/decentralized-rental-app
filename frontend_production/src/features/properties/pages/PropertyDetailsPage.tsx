import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Heart, Star, MapPin, Users, Bed, Bath, Home, Wifi,
    Shield, Calendar, ChevronLeft, ChevronRight, X, Share2,
    Clock, Loader2, Locate
} from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls, type MapRef } from '@/components/ui/map';
import { usePropertiesStore } from '../hooks/usePropertiesStore';
import { formatPrice, resolveImageUrl } from '../types/properties.types';
import { Navbar } from '@/components/Layout/Navbar/Navbar';
import { PropertyIcons } from '@/constants/PropertyIcons';

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
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden">
                <div
                    className="col-span-2 row-span-2 cursor-pointer relative group"
                    onClick={() => setShowLightbox(true)}
                >
                    <img
                        src={resolveImageUrl(images[0])}
                        alt="Main"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>
                {images.slice(1, 5).map((img, idx) => (
                    <div
                        key={idx}
                        className="cursor-pointer relative group"
                        onClick={() => {
                            setSelectedImage(idx + 1);
                            setShowLightbox(true);
                        }}
                    >
                        <img
                            src={resolveImageUrl(img)}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                        {idx === 3 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-semibold">+{images.length - 5} more</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showLightbox && (
                <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-4 text-white p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="max-w-5xl max-h-[90vh] relative">
                        <img
                            src={resolveImageUrl(images[selectedImage])}
                            alt="Selected"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
                            {selectedImage + 1} / {images.length}
                        </div>
                    </div>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 text-white p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
            )}
        </>
    );
};

import { BookingWidget } from '@/features/booking/components/BookingWidget';

import { toast } from '@/components/ui/use-toast';

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

export default function PropertyDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { currentProperty, loading, fetchPropertyById, resetCurrentProperty } = usePropertiesStore();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const mapRef = useRef<MapRef>(null);

    const handleBackToDestination = () => {
        if (!currentProperty || !mapRef.current) return;
        mapRef.current.flyTo({
            center: [currentProperty.longitude, currentProperty.latitude],
            zoom: 14,
            essential: true
        });
    };

    const handleShare = async () => {
        if (!currentProperty) return;

        const url = window.location.href;
        const title = currentProperty.title;
        const text = `Check out this property: ${title}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(url);
                toast({
                    title: "Link copied!",
                    description: "The property link has been copied to your clipboard.",
                });
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    useEffect(() => {
        if (id) {
            fetchPropertyById(id);
        } else {
            // Default load for testing if no ID in URL
            fetchPropertyById('1');
        }
        return () => resetCurrentProperty();
    }, [id, fetchPropertyById, resetCurrentProperty]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!currentProperty) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-600">Property not found</p>
            </div>
        );
    }

    const property = currentProperty;
    const displayAmenities = showAllAmenities
        ? property.characteristics
        : property.characteristics.slice(0, 10);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">

                            <span className="text-gray-600">·</span>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="font-semibold">{property.city}, {property.country}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm font-semibold underline">Share</span>
                            </button>

                        </div>
                    </div>
                </div>

                <ImageGallery images={property.imageFolderPath || []} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="pb-8 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">
                                        {property.type} hosted by Owner
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <span>{property.nbOfGuests} guests</span>
                                        <span>·</span>
                                        <span>{property.nbOfBedrooms} bedrooms</span>
                                        <span>·</span>
                                        <span>{property.nbOfBeds} beds</span>
                                        <span>·</span>
                                        <span>{property.nbOfBathrooms} baths</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Created in {formatDate(property.createdAt)}
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    O
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <Home className="w-6 h-6 text-gray-700 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Entire place</h3>
                                        <p className="text-gray-600 text-sm">You'll have the apartment to yourself.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Shield className="w-6 h-6 text-gray-700 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Enhanced Clean</h3>
                                        <p className="text-gray-600 text-sm">This host committed to enhanced cleaning process.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <MapPin className="w-6 h-6 text-gray-700 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Great location</h3>
                                        <p className="text-gray-600 text-sm">90% of recent guests gave the location a 5-star rating.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pb-8 border-b border-gray-200">
                            <p className="text-gray-700 leading-relaxed">{property.description}</p>
                        </div>

                        <div className="pb-8 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {displayAmenities.map((amenity) => {
                                    const Icon = PropertyIcons[amenity.name] || Home;
                                    return (
                                        <div key={amenity.id} className="flex items-center gap-3 py-3">
                                            <Icon className="w-6 h-6 text-gray-700" />
                                            <span>{amenity.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {property.characteristics.length > 10 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-6 px-6 py-3 border border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    {showAllAmenities ? 'Show less' : `Show all ${property.characteristics.length} amenities`}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <BookingWidget
                            propertyId={property.propertyId}
                            pricePerNight={property.pricePerNight}
                            maxGuests={property.nbOfGuests}
                        />
                    </div>
                </div>

                <div className="mt-12 pb-12 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold mb-6">Where you'll be</h2>
                    <div className="mb-4">
                        <p className="text-gray-700">
                            {property.addressName}, {property.city}
                        </p>
                    </div>
                    <div className="h-96 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
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
                                    {(() => {
                                        const Icon = PropertyIcons[property.type] || Home;
                                        return (
                                            <div className="p-2 bg-black rounded-full shadow-lg text-white border-2 border-white animate-bounce flex items-center justify-center">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        );
                                    })()}
                                </MarkerContent>
                            </MapMarker>
                            <MapControls showZoom showLocate showFullscreen />
                        </Map>
                        <div className="absolute bottom-4 right-4 z-10">
                            <button
                                onClick={handleBackToDestination}
                                className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                <Locate className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold">Back to Destination</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-gray-50 border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-600">
                    © 2026 Decentralized Rentals. All rights reserved.
                </div>
            </footer>
        </div>
    );
}