// src/features/properties/services/properties.service.ts
import { publicApiClient } from "@/lib/api/publicApiClient";
import {
    Property,
    PropertySummary,
    PaginatedResponse,
    SearchFilters,
    NearbySearchFilters,
    Characteristic,
    CharacteristicType,
    ApiErrorResponse,
    PropertyCountResponse,
    PropertyWithDistance
} from "../types/properties.types";
import { privateApiClient } from "@/lib/api/privateApiClient";

export const PropertiesService = {
    // ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

    /**
     * 1. LIST ALL ACTIVE PROPERTIES
     * GET /api/listings/properties?page=0&size=20&sortBy=createdAt&sortDir=DESC
     * 
     * Business Logic:
     * - Returns only ACTIVE properties
     * - Excludes: DRAFT, PENDING, HIDDEN, DELETED
     * - Default sort: newest first
     */
    getAllProperties: async (
        page: number = 0,
        size: number = 20,
        sortBy: string = 'createdAt',
        sortDir: string = 'DESC'
    ): Promise<PaginatedResponse<PropertySummary>> => {
        try {
            const response = await publicApiClient.get('/listings/properties', {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDir
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch properties:", error);
            if (error.response?.status === 400) {
                throw new Error("Invalid pagination parameters");
            }
            throw new Error(error.response?.data?.message || "Failed to fetch properties");
        }
    },

    /**
     * 1.1 GET TOTAL PROPERTIES COUNT
     * GET /api/listings/properties/count
     */
    getTotalPropertiesCount: async (): Promise<number> => {
        try {
            const response = await publicApiClient.get('/listings/properties/count');
            return response.data.count;
        } catch (error: any) {
            console.error("Failed to fetch property count:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch property count");
        }
    },
    getOwnerWalletByPropertyId: async (propertyId: string): Promise<string> => {
        try {
            const response = await privateApiClient.get(`/listings/owners/${propertyId}`);
            return response.data.walletAddress; // returns "0x1234..."
        } catch (error: any) {
            console.error("Failed to fetch owner wallet:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch owner wallet");
        }
    },

    /**
     * 2. GET PROPERTY DETAILS
     * GET /api/listings/properties/{propertyId}
     * 
     * Business Logic:
     * - Returns complete property details
     * - Only returns ACTIVE properties to public
     * - Owners can see all statuses except DELETED via protected endpoints
     */
    getPropertyById: async (propertyId: string): Promise<Property> => {
        try {
            const response = await publicApiClient.get(`/listings/properties/${propertyId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error("Property not found");
            }
            if (error.response?.status === 403) {
                throw new Error("This property is not publicly available");
            }
            console.error("Failed to fetch property details:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch property details");
        }
    },

    /**
     * 3. SEARCH PROPERTIES WITH FILTERS
     * GET /api/listings/properties/search?city=Casablanca&type=VILLA&...
     * 
     * Business Logic:
     * - All filters are optional (AND logic)
     * - Returns only ACTIVE properties
     * - City search is case-insensitive
     */
    searchProperties: async (filters: SearchFilters): Promise<PaginatedResponse<PropertySummary>> => {
        try {
            // Clean filters - remove undefined/null values
            const cleanFilters: Record<string, any> = {};

            Object.entries(filters).forEach(([key, value]) => {
                // Skip undefined/null
                if (value == null) return;

                // Skip empty strings but allow 0
                if (typeof value === 'string' && value.trim() === '') return;

                // Handle characteristics array
                if (key === 'characteristics' && Array.isArray(value)) {
                    const validIds = value.filter(v => !isNaN(Number(v)) && Number(v) > 0);
                    if (validIds.length > 0) {
                        cleanFilters[key] = validIds.join(','); // Convert to comma-separated
                    }
                    return;
                }

                cleanFilters[key] = value;
            });

            const response = await publicApiClient.get('/listings/properties/search', {
                params: cleanFilters,
                paramsSerializer: { indexes: null }
            });

            return response.data;
        } catch (error: any) {
            console.error("Failed to search properties:", error);

            // Enhanced error messages
            if (error.response?.status === 400) {
                const message = error.response.data?.message || "Invalid search parameters";
                if (message.includes('price')) {
                    throw new Error("Invalid price range: minimum cannot exceed maximum");
                }
                throw new Error(message);
            }

            throw new Error(error.response?.data?.message || "Failed to search properties");
        }
    },

    /**
     * 4. NEARBY PROPERTIES SEARCH
     * GET /api/listings/properties/nearby?latitude=33.5731&longitude=-7.5898&radius=10
     * 
     * Business Logic:
     * - Returns properties within radius (default 10km)
     * - Only ACTIVE properties
     * - Sorted by distance (nearest first)
     * - Uses Haversine formula for distance calculation
     */
    getNearbyProperties: async (
        filters: NearbySearchFilters
    ): Promise<PaginatedResponse<PropertyWithDistance>> => {
        try {
            // Validate required parameters
            if (filters.latitude === undefined || filters.longitude === undefined) {
                throw new Error("Latitude and longitude are required for nearby search");
            }

            // Set defaults
            const params = {
                latitude: filters.latitude,
                longitude: filters.longitude,
                radius: filters.radius || 10, // Default 10km
                page: filters.page || 0,
                size: filters.size || 20
            };

            const response = await publicApiClient.get('/listings/properties/nearby', { params });

            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch nearby properties:", error);

            // Handle specific error cases
            if (error.message?.includes('Latitude and longitude')) {
                throw error;
            }

            if (error.response?.status === 400) {
                const message = error.response.data?.message || "Invalid coordinates";
                if (message.includes('latitude') || message.includes('longitude')) {
                    throw new Error("Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180.");
                }
                throw new Error(message);
            }

            throw new Error(error.response?.data?.message || "Failed to fetch nearby properties");
        }
    },

    // ==================== CHARACTERISTICS ====================

    /**
     * 16. GET ALL CHARACTERISTICS
     * GET /api/listings/characteristics
     * 
     * Business Logic:
     * - Returns all active characteristics
     * - Used for filtering and property creation
     */
    getAllCharacteristics: async (): Promise<Characteristic[]> => {
        try {
            const response = await publicApiClient.get('/listings/characteristics');
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch characteristics:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch characteristics");
        }
    },

    /**
     * 17. GET CHARACTERISTIC TYPES
     * GET /api/listings/type-caracteristiques
     * 
     * Business Logic:
     * - Returns categories for grouping characteristics
     * - Used for UI organization
     */
    getCharacteristicTypes: async (): Promise<CharacteristicType[]> => {
        try {
            const response = await publicApiClient.get('/listings/type-caracteristiques');
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch characteristic types:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch characteristic types");
        }
    },

    /**
     * Helper: Group characteristics by type
     * Useful for UI organization
     */
    getCharacteristicsGroupedByType: async (): Promise<Record<string, Characteristic[]>> => {
        try {
            const [characteristics, types] = await Promise.all([
                PropertiesService.getAllCharacteristics(),
                PropertiesService.getCharacteristicTypes()
            ]);

            const grouped: Record<string, Characteristic[]> = {};

            // Initialize with types
            types.forEach(type => {
                grouped[type.name] = [];
            });

            // Add "Other" category
            grouped['Other'] = [];

            // Group characteristics
            characteristics.forEach(char => {
                if (char.isActive) { // Only include active characteristics
                    const typeName = char.typeCaracteristique?.name || 'Other';
                    if (!grouped[typeName]) {
                        grouped[typeName] = [];
                    }
                    grouped[typeName].push(char);
                }
            });

            // Remove empty groups
            Object.keys(grouped).forEach(key => {
                if (grouped[key].length === 0) {
                    delete grouped[key];
                }
            });

            return grouped;
        } catch (error: any) {
            console.error("Failed to group characteristics:", error);
            throw error;
        }
    },

    // ==================== UTILITY METHODS ====================

    /**
     * Format distance for display
     */
    formatDistance: (distance?: number): string => {
        if (!distance) return '';
        if (distance < 1) {
            return `${Math.round(distance * 1000)} m`;
        }
        return `${distance.toFixed(1)} km`;
    },



    /**
     * Check if property is available for booking
     */
    isAvailableForBooking: (status: string): boolean => {
        return status === 'ACTIVE';
    },

    /**
     * Format price for display
     */
    formatPrice: (price: number, currency: string = 'MAD'): string => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    }
};