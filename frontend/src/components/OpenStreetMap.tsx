// components/OpenStreetMap.tsx
import { useEffect, useState } from 'react';
import { mockProperties } from '@/lib/data';

interface OpenStreetMapProps {
  selectedProperty?: number | null;
  onPropertySelect?: (propertyId: number) => void;
}

export default function OpenStreetMap({ selectedProperty, onPropertySelect }: OpenStreetMapProps) {
  const [mapType, setMapType] = useState<'interactive' | 'static'>('interactive');
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060, zoom: 13 });

  // Sample coordinates for properties - in real app, these would come from property data
  const propertyCoordinates = [
    { id: 1, lat: 40.7128, lng: -74.0060, title: 'Luxury Apartment' },
    { id: 2, lat: 40.7218, lng: -74.0160, title: 'Modern Condo' },
    { id: 3, lat: 40.7028, lng: -73.9960, title: 'City View Studio' },
    { id: 4, lat: 40.7328, lng: -74.0260, title: 'Downtown Loft' },
    { id: 5, lat: 40.6928, lng: -74.0360, title: 'Waterfront Property' },
  ];

  // Generate markers for static map
  const generateStaticMapMarkers = () => {
    return propertyCoordinates.map(coord => 
      `&markers=${coord.lat},${coord.lng}`
    ).join('');
  };

  // Generate iframe URL for interactive map
  const getInteractiveMapUrl = () => {
    const baseUrl = 'https://www.openstreetmap.org/export/embed.html';
    const bbox = [
      coordinates.lng - 0.02, // min longitude
      coordinates.lat - 0.02, // min latitude
      coordinates.lng + 0.02, // max longitude
      coordinates.lat + 0.02  // max latitude
    ].join(',');
    
    return `${baseUrl}?bbox=${bbox}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`;
  };

  // Static map URL
  const staticMapUrl = `https://static-maps.yandex.ru/1.x/?ll=${coordinates.lng},${coordinates.lat}&z=${coordinates.zoom}&size=600,400&l=map${generateStaticMapMarkers()}`;

  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden border">
      {/* Map Type Toggle */}
      <div className="flex bg-gray-100 p-2 border-b">
        <button
          onClick={() => setMapType('interactive')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
            mapType === 'interactive'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Interactive Map
        </button>
        <button
          onClick={() => setMapType('static')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
            mapType === 'static'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Static Map
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {mapType === 'interactive' ? (
          // Interactive OpenStreetMap
          <iframe
            src={getInteractiveMapUrl()}
            className="w-full h-full border-0"
            title="OpenStreetMap"
            loading="lazy"
          />
        ) : (
          // Static Map with markers
          <div className="w-full h-full relative">
            <img
              src={staticMapUrl}
              alt="Property Locations"
              className="w-full h-full object-cover"
            />
            {/* Interactive overlay for markers */}
            {propertyCoordinates.map((coord) => (
              <button
                key={coord.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg hover:bg-red-600 transition-colors"
                style={{
                  left: `${((coord.lng - (coordinates.lng - 0.02)) / 0.04) * 100}%`,
                  top: `${((coordinates.lat + 0.02 - coord.lat) / 0.04) * 100}%`,
                }}
                onClick={() => onPropertySelect?.(coord.id)}
                title={coord.title}
              />
            ))}
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="bg-gray-50 p-3 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Powered by OpenStreetMap</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCoordinates(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
            >
              Zoom +
            </button>
            <button
              onClick={() => setCoordinates(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 10) }))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
            >
              Zoom -
            </button>
          </div>
        </div>
      </div>

      {/* Property List Overlay for Mobile */}
      <div className="lg:hidden bg-white border-t p-4">
        <h4 className="font-semibold mb-2">Properties on Map</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {propertyCoordinates.map(coord => (
            <button
              key={coord.id}
              onClick={() => onPropertySelect?.(coord.id)}
              className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex justify-between items-center"
            >
              <span>{coord.title}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                View
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}