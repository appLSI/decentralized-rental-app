import React, { useState } from "react";
import { Bed, Bath, Users, MapPin } from "lucide-react";
import { PropertySummary, formatPrice, resolveImageUrl } from "../types/properties.types";
import { PropertyIcons } from "@/constants/PropertyIcons";

interface PropertyCardProps {
    property: PropertySummary;
    variant?: "vertical" | "horizontal";
    onClick?: () => void;
    onLocationClick?: (e: React.MouseEvent) => void;
}

/* ----------------- Vertical Card ----------------- */
export const PropertyCardVertical: React.FC<PropertyCardProps> = ({
    property,
    onClick,
    onLocationClick,
}) => {
    const [currentImage, setCurrentImage] = useState(0);
    const ethPrice = (property.pricePerNight / 1000).toFixed(3);
    const images = property.images?.length
        ? property.images
        : [(property as any).imageFolderPath?.[0]];

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);

    return (
        <div
            className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col"
            onClick={onClick}
        >
            {/* Image Carousel */}
            <div className="relative overflow-hidden aspect-[4/3]">
                <img
                    src={resolveImageUrl(images[currentImage])}
                    alt={property.title}
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                    onClick={(e) => { e.stopPropagation(); onLocationClick?.(e); }}
                    className="absolute top-3 left-3 bg-black/90 hover:bg-black/90 text-white rounded-full p-2 shadow-sm transition-all transform hover:scale-110 z-10"
                    title="Show on map"
                >
                    <MapPin className="w-4 h-4" />
                </button>

                {/* Carousel Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-2 w-full flex justify-center gap-2">
                        {images.map((_, index) => (
                            <span
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === currentImage ? "bg-slate-800" : "bg-slate-400/50"
                                    }`}
                                onClick={(e) => { e.stopPropagation(); setCurrentImage(index); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {property.type} · {property.city}
                    </p>
                </div>

                <h3 className="text-base font-bold mb-2 text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {property.title}
                </h3>

                <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 opacity-70" /> <span>{property.nbOfGuests}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 opacity-70" /> <span>{property.nbOfBedrooms} br</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 opacity-70" /> <span>{property.nbOfBathrooms} ba</span>
                    </div>
                </div>

                {/* Characteristics */}
                {property.characteristics && property.characteristics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {property.characteristics.slice(0, 3).map((c) => {
                            const Icon = PropertyIcons[c.name];
                            return (
                                <span key={c.id} className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    {Icon && <Icon className="w-3 h-3" />}
                                    {c.name}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Pricing */}
                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-extrabold text-slate-900">{formatPrice(property.pricePerNight)}</span>
                            <span className="text-xs text-slate-500 font-medium">/ night</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{ethPrice} ETH</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ----------------- Horizontal Card ----------------- */
export const PropertyCardHorizontal: React.FC<PropertyCardProps> = ({
    property,
    onClick,
    onLocationClick,
}) => {
    const [currentImage, setCurrentImage] = useState(0);
    const ethPrice = (property.pricePerNight / 1000).toFixed(3);
    const images = property.images?.length
        ? property.images
        : [(property as any).imageFolderPath?.[0]];

    return (
        <div
            className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer flex border border-slate-100 flex-col sm:flex-row"
            onClick={onClick}
        >
            {/* Image Carousel */}
            <div className="relative flex-shrink-0 w-full sm:w-2/5 aspect-video overflow-hidden">
                <img
                    src={resolveImageUrl(images[currentImage])}
                    alt={property.title}
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                    onClick={(e) => { e.stopPropagation(); onLocationClick?.(e); }}
                    className="absolute top-3 left-3 bg-black/90 hover:bg-black/90 text-white rounded-full p-2 shadow-sm transition-all transform hover:scale-110 z-10"
                    title="Show on map"
                >
                    <MapPin className="w-4 h-4" />
                </button>

                {/* Carousel Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-2 w-full flex justify-center gap-2">
                        {images.map((_, index) => (
                            <span
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === currentImage ? "bg-slate-800" : "bg-slate-400/50"
                                    }`}
                                onClick={(e) => { e.stopPropagation(); setCurrentImage(index); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 flex flex-col min-w-0">
                <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                        {property.type} in {property.city}
                    </p>

                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-3">
                        {property.title}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-3 flex-wrap">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Users className="w-4 h-4 opacity-70" />
                            <span>{property.nbOfGuests} guests</span>
                        </span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Bed className="w-4 h-4 opacity-70" />
                            <span>{property.nbOfBedrooms} br</span>
                        </span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Bath className="w-4 h-4 opacity-70" />
                            <span>{property.nbOfBathrooms} ba</span>
                        </span>
                    </div>

                    {property.characteristics && property.characteristics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {property.characteristics.slice(0, 3).map((c) => {
                                const Icon = PropertyIcons[c.name];
                                return (
                                    <span key={c.id} className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1">
                                        {Icon && <Icon className="w-3 h-3" />}
                                        {c.name}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom Pricing */}
                <div className="flex items-end justify-between pt-3 mt-auto border-t border-slate-100">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-extrabold text-slate-900">
                                {formatPrice(property.pricePerNight)}
                            </span>
                            <span className="text-sm text-slate-500 font-medium">/ night</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{ethPrice} ETH</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ----------------- Main Component ----------------- */
const PropertyCard: React.FC<PropertyCardProps> = (props) => {
    if (props.variant === "horizontal") return <PropertyCardHorizontal {...props} />;
    return <PropertyCardVertical {...props} />;
};

export default PropertyCard;
