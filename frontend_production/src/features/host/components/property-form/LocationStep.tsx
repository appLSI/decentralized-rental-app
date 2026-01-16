import React, { useState, useEffect } from 'react';
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin } from 'lucide-react';
import { Map, MapMarker, MapControls, useMap, MarkerContent } from "@/components/ui/map";
import { PropertyFormData } from '../../types/host.types';

// Helper component to handle map events
function MapEvents({ onClick }: { onClick: (e: any) => void }) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const handleClick = (e: any) => {
            onClick(e);
        };

        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [map, onClick]);

    return null;
}

const LocationStep: React.FC = () => {
    const { control, setValue, watch } = useFormContext<PropertyFormData>();
    const currentLat = watch('latitude');
    const currentLng = watch('longitude');

    const [viewState, setViewState] = useState({
        latitude: currentLat,
        longitude: currentLng,
        zoom: 13
    });

    const handleLocationSelect = (event: { lng: number; lat: number }) => {
        const { lng, lat } = event;
        setValue('longitude', lng);
        setValue('latitude', lat);
        setViewState(prev => ({ ...prev, longitude: lng, latitude: lat }));
    };

    const handleLocate = (coords: { longitude: number; latitude: number }) => {
        setValue('longitude', coords.longitude);
        setValue('latitude', coords.latitude);
        setViewState(prev => ({ ...prev, ...coords, zoom: 15 }));
    };

    return (
        <div className="space-y-10">
            <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                    <FormField
                        control={control}
                        name="addressName"
                        rules={{ required: "Address is required" }}
                        render={({ field }) => (
                            <FormItem className="md:col-span-2 space-y-3">
                                <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">Street Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="123 Main St"
                                        {...field}
                                        className="h-14 px-6 rounded-2xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="city"
                        rules={{ required: "City is required" }}
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">City</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Casablanca"
                                        {...field}
                                        className="h-14 px-6 rounded-2xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="country"
                        rules={{ required: "Country is required" }}
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">Country</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Morocco"
                                        {...field}
                                        className="h-14 px-6 rounded-2xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="state"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">State / Province</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Grand Casablanca"
                                        {...field}
                                        className="h-14 px-6 rounded-2xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="codePostale"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1">Postal Code</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="20000"
                                        {...field}
                                        className="h-14 px-6 rounded-2xl bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-all"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-6 border-t-2 border-gray-100">
                    <FormLabel className="text-sm font-bold text-black uppercase tracking-wide ml-1 mb-4 block">Select Location on Map</FormLabel>
                    <div className="h-[450px] w-full rounded-[2rem] border-2 border-gray-100 overflow-hidden relative group shadow-inner">
                        <Map
                            center={[viewState.longitude, viewState.latitude]}
                            zoom={viewState.zoom}
                        >
                            <MapEvents onClick={e => handleLocationSelect(e.lngLat)} />
                            <MapMarker
                                longitude={currentLng}
                                latitude={currentLat}
                                draggable
                                onDragEnd={handleLocationSelect}
                            >
                                <MarkerContent className="cursor-move">
                                    <div className="text-black drop-shadow-xl">
                                        <MapPin className="h-10 w-10 fill-current" />
                                    </div>
                                </MarkerContent>
                            </MapMarker>
                            <MapControls showLocate onLocate={handleLocate} position="top-left" />
                        </Map>
                        <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-xl z-10">
                            <p className="text-white text-xs font-mono font-bold tracking-wider">
                                {currentLat.toFixed(6)}° N, {currentLng.toFixed(6)}° E
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationStep;
