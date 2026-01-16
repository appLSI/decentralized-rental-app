/**
 * Geolocation Service
 * Provides methods to interact with browser Geolocation API
 */

export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
}

export interface LocationData {
    coords: LocationCoordinates;
    timestamp: number;
    address?: string;
    city?: string;
}

export interface GeolocationError {
    code: number;
    message: string;
}

/**
 * Reverse geocode coordinates to get city/address
 * Uses OpenStreetMap Nominatim API (free, no key needed)
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        // Try to get city, then town, then village
        const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Unknown Location";

        return city;
    } catch (error) {
        console.error("❌ Reverse geocoding failed:", error);
        return "Unknown Location";
    }
};

/**
 * Get current user location with reverse geocoding
 */
export const getCurrentLocation = async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject({
                code: 0,
                message: "Geolocation not supported by this browser",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const city = await reverseGeocode(latitude, longitude);

                resolve({
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                    },
                    timestamp: position.timestamp,
                    city,
                });
            },
            (error) => {
                reject({
                    code: error.code,
                    message: error.message,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
