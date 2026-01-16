import { forwardRef } from "react";
import { Map, MapMarker, MarkerPopup, MarkerContent, MarkerLabel, MapControls } from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";
import { PropertySummary, formatPrice, resolveImageUrl } from "../types/properties.types";
import { PropertyIcons } from "@/constants/PropertyIcons";
import { Home } from "lucide-react";
import MapLibreGL from "maplibre-gl";

interface MapViewProps {
    properties: PropertySummary[];
    featuredProperty?: PropertySummary;
    onPropertyClick?: (propertyId: string) => void;
}

export const MapView = forwardRef<MapLibreGL.Map, MapViewProps>(
    ({ properties, featuredProperty, onPropertyClick }, ref) => {
        return (
            <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg">
                <Map
                    ref={ref}
                    center={[properties[0]?.longitude || 0, properties[0]?.latitude || 0]}
                    zoom={12}
                >
                    {/* --- Property Markers --- */}
                    {properties.map((property) => {
                        const images = property.images?.length
                            ? property.images
                            : [(property as any).imageFolderPath?.[0]];
                        const displayImage = images[0];

                        return (
                            <MapMarker
                                key={property.propertyId}
                                longitude={property.longitude}
                                latitude={property.latitude}
                            >
                                <MarkerContent>
                                    {(() => {
                                        const Icon = PropertyIcons[property.type] || Home;
                                        return (
                                            <div className="p-1.5 bg-black rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform text-white">
                                                <Icon className="w-3 h-3" />
                                            </div>
                                        );
                                    })()}
                                    <MarkerLabel position="bottom" className="text-xs font-medium bg-white/90 px-1 py-0.5 rounded shadow-sm">
                                        {formatPrice(property.pricePerNight)}
                                    </MarkerLabel>
                                </MarkerContent>

                                <MarkerPopup className="p-0 overflow-hidden rounded-xl w-64">
                                    <div className="flex flex-col">
                                        <div className="relative h-40 w-full overflow-hidden">
                                            {displayImage ? (
                                                <img
                                                    src={resolveImageUrl(displayImage)}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                    <MapPin size={24} />
                                                </div>
                                            )}

                                        </div>
                                        <div className="p-3 bg-white">
                                            <div className="mb-1">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                                    {property.type} · {property.city}
                                                </p>
                                                <h3 className="font-bold text-slate-900 text-sm truncate">{property.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                                                <span>{property.nbOfBedrooms} br</span>
                                                <span>{property.nbOfBathrooms} ba</span>
                                                <span>{property.nbOfGuests} guests</span>
                                            </div>
                                        </div>
                                    </div>
                                </MarkerPopup>
                            </MapMarker>
                        );
                    })}



                    {/* --- Built-in Map Controls --- */}
                    <MapControls
                        position="bottom-right"
                        showZoom={true}
                        showFullscreen={true}
                        showCompass={true}
                        showLocate={true}
                    />
                </Map>
            </div>
        );
    }
);

MapView.displayName = "MapView";
