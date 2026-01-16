/**
 * Geolocation Store
 * Zustand store for managing geolocation state globally
 */

import { create } from "zustand";
import {
    LocationData,
    GeolocationError,
    getCurrentLocation,
} from "./geolocation.service";

interface GeolocationStore {
    location: LocationData | null;
    error: GeolocationError | null;
    loading: boolean;
    city: string | null;

    // Actions
    requestLocation: () => Promise<void>;
    clearLocation: () => void;
    clearError: () => void;
}

export const useGeolocationStore = create<GeolocationStore>((set) => ({
    location: null,
    error: null,
    loading: false,
    city: null,

    requestLocation: async () => {
        set({ loading: true, error: null });
        try {
            const locationData = await getCurrentLocation();
            set({
                location: locationData,
                city: locationData.city,
                loading: false,
            });

            console.log("✅ Location acquired successfully");
            console.log(`📍 City: ${locationData.city}`);
            console.log(
                `📍 Coordinates: ${locationData.coords.latitude.toFixed(
                    6
                )}, ${locationData.coords.longitude.toFixed(6)}`
            );
            console.log(`📍 Accuracy: ±${locationData.coords.accuracy.toFixed(2)}m`);
        } catch (err: any) {
            const error: GeolocationError = {
                code: err.code || 0,
                message: err.message || "Unknown error occurred",
            };
            set({ error, loading: false });

            console.error("❌ Geolocation Error:", error.message);
            console.log("Error Code:", error.code);
        }
    },

    clearLocation: () => set({ location: null, city: null }),
    clearError: () => set({ error: null }),
}));
