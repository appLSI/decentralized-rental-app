import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, Users, Search, ChevronDown,
    Layers, Menu, X, Loader2, Home, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { MapView } from '../componentes/MapView';
import PropertyCard from '../componentes/PropertyCard';
import { type MapRef } from '@/components/ui/map';
import { usePropertiesStore } from '../hooks/usePropertiesStore';
import { Property, PropertySummary, SearchFilters } from '../types/properties.types';
import { Navbar } from '@/components/Layout/Navbar/Navbar';

const Dropdown = ({
    label,
    options,
    value,
    onChange
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-2 bg-white"
            >
                <span className="text-sm font-medium text-gray-700">
                    {value || label}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function PropertySearchPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { properties, pagination, loading, fetchProperties, searchProperties } = usePropertiesStore();

    const [location, setLocation] = useState(searchParams.get('city') || '');
    const [guests, setGuests] = useState(searchParams.get('guests') || '');
    const [showMap, setShowMap] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null);
    const mapRef = useRef<MapRef>(null);

    const [priceFilter, setPriceFilter] = useState(searchParams.get('price') || 'Any Price');
    const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'Any Type');
    const [sortFilter, setSortFilter] = useState(searchParams.get('sort') || 'Newest');

    const [isSearched, setIsSearched] = useState(!!searchParams.get('city'));

    useEffect(() => {
        if (isSearched) {
            handleSearch(parseInt(searchParams.get('page') || '0'));
        } else {
            fetchProperties(0, 12);
        }
    }, []);

    // Automatic map navigation when properties load
    useEffect(() => {
        if (properties.length > 0 && mapRef.current) {
            // Find bounds or center
            const lats = properties.map(p => p.latitude);
            const lngs = properties.map(p => p.longitude);

            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            // If there's only one property or they are very close
            if (maxLat - minLat < 0.01 && maxLng - minLng < 0.01) {
                mapRef.current.flyTo({
                    center: [properties[0].longitude, properties[0].latitude],
                    zoom: 13,
                    essential: true
                });
            } else {
                // Fit bounds
                mapRef.current.fitBounds(
                    [[minLng, minLat], [maxLng, maxLat]],
                    { padding: 80, duration: 2000 }
                );
            }
        }
    }, [properties]);

    const handleSearch = async (page = 0) => {
        setIsSearched(true);
        const [sortBy, sortDir] = getSortParams(sortFilter);
        const [minPrice, maxPrice] = getPriceRange(priceFilter);

        const searchFilters: SearchFilters = {
            city: location || undefined,
            type: typeFilter !== 'Any Type' ? typeFilter : undefined,
            nbOfGuests: guests ? parseInt(guests) : undefined,
            minPrice,
            maxPrice,
            sortBy: sortBy as any,
            sortDir: sortDir as any,
            page,
            size: 12
        };

        // Update URL
        const params: Record<string, string> = {};
        if (location) params.city = location;
        if (guests) params.guests = guests;
        if (typeFilter !== 'Any Type') params.type = typeFilter;
        if (priceFilter !== 'Any Price') params.price = priceFilter;
        if (sortFilter !== 'Newest') params.sort = sortFilter;
        if (page > 0) params.page = page.toString();
        setSearchParams(params);

        await searchProperties(searchFilters);
    };

    const handleReset = () => {
        setLocation('');
        setGuests('');
        setPriceFilter('Any Price');
        setTypeFilter('Any Type');
        setSortFilter('Newest');
        setIsSearched(false);
        setSearchParams({});
        fetchProperties(0, 12);
    };

    const getSortParams = (label: string) => {
        switch (label) {
            case 'Oldest': return ['createdAt', 'ASC'];
            case 'Newest': default: return ['createdAt', 'DESC'];
        }
    };

    const getPriceRange = (label: string) => {
        switch (label) {
            case '$0 - $100': return [0, 100];
            case '$100 - $200': return [100, 200];
            case '$200 - $300': return [200, 300];
            case '$300+': return [300, 1000000];
            default: return [undefined, undefined];
        }
    };

    const handlePropertyMapClick = (prop: PropertySummary) => {
        setSelectedProperty(prop);
        setShowMap(true);

        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [prop.longitude, prop.latitude],
                zoom: 15,
                essential: true
            });
        }
    };

    const priceOptions = ['Any Price', '$0 - $100', '$100 - $200', '$200 - $300', '$300+'];
    const typeOptions = ['Any Type', 'APARTMENT', 'HOUSE', 'CONDO', 'VILLA', 'CABIN'];
    const sortOptions = ['Newest', 'Oldest'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Navbar />

            {/* Search Bar & Filters */}
            <div className="bg-white border-b border-slate-200 w-full sticky top-[72px] z-20">
                <div className="px-6 lg:px-10 py-4 max-w-[2000px] mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex-1 flex items-center gap-3 px-6 py-2.5 border-r border-slate-100">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <input
                                    type="text"
                                    placeholder="Where to?"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
                                />
                            </div>

                            <div className="flex-1 flex items-center gap-3 px-6 py-2.5 border-r border-slate-100">
                                <Users className="w-4 h-4 text-blue-600" />
                                <input
                                    type="number"
                                    placeholder="Add guests"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
                                    min="1"
                                />
                            </div>

                            <button
                                onClick={() => handleSearch()}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full m-1 transition-all transform active:scale-95"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <Dropdown
                                label="Price"
                                options={priceOptions}
                                value={priceFilter}
                                onChange={setPriceFilter}
                            />
                            <Dropdown
                                label="Type"
                                options={typeOptions}
                                value={typeFilter}
                                onChange={setTypeFilter}
                            />
                            <Dropdown
                                label="Sort"
                                options={sortOptions}
                                value={sortFilter}
                                onChange={setSortFilter}
                            />
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>

                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm transform active:scale-95"
                        >
                            {showMap ? <X className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                            <span className="text-sm font-semibold">{showMap ? 'Hide Map' : 'Show Map'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-215px)] overflow-hidden">
                {/* Listings */}
                <div className={`${showMap ? 'w-[45%]' : 'w-full'} transition-all duration-300 overflow-y-auto bg-slate-50/50`}>
                    <div className="pl-8 pr-4">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    {pagination.totalElements}+ stays {isSearched && location ? `in ${location}` : ''}
                                </h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Discover unique properties matching your style</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin opacity-50" />
                                <p className="text-sm font-medium text-slate-400">Finding properties...</p>
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-slate-300">
                                <p className="text-slate-500 font-medium">No properties found. Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className={`grid gap-8 ${showMap ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                                {properties.map((property) => (
                                    <PropertyCard
                                        key={property.propertyId}
                                        property={property}
                                        variant={showMap ? 'horizontal' : 'vertical'}
                                        onClick={() => navigate(`/properties/${property.propertyId}`)}
                                        onLocationClick={(e) => {
                                            e.stopPropagation();
                                            handlePropertyMapClick(property);
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && properties.length > 0 && (
                            <div className="mt-12 flex flex-col items-center gap-6 border-t border-slate-100 pt-12">
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={pagination.currentPage === 0}
                                        onClick={() => isSearched ? handleSearch(pagination.currentPage - 1) : fetchProperties(pagination.currentPage - 1)}
                                        className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => isSearched ? handleSearch(i) : fetchProperties(i)}
                                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${pagination.currentPage === i
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        disabled={pagination.currentPage >= pagination.totalPages - 1}
                                        onClick={() => isSearched ? handleSearch(pagination.currentPage + 1) : fetchProperties(pagination.currentPage + 1)}
                                        className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-sm font-medium text-slate-500">
                                    Page <span className="text-slate-900 font-bold">{pagination.currentPage + 1}</span> of <span className="text-slate-900 font-bold">{pagination.totalPages}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map */}
                {showMap && (
                    <div className="w-[55%] h-full bg-slate-100 relative">
                        <MapView
                            ref={mapRef}
                            properties={properties}
                            featuredProperty={selectedProperty || undefined}
                            onPropertyClick={(id) => {
                                const prop = properties.find(p => p.propertyId === id);
                                if (prop) setSelectedProperty(prop);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
