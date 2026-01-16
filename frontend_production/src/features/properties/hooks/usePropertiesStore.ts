// src/features/properties/stores/properties.store.ts
import { create } from 'zustand';
import { PropertiesService } from '../services/properties.services';
import {
    Property,
    PropertySummary,
    PaginatedResponse,
    SearchFilters,
    NearbySearchFilters,
    Characteristic,
    CharacteristicType,
    PropertyWithDistance,
    PropertyStatusHelper
} from '../types/properties.types';
import { PROPERTY_STATUS_LABELS } from '@/constants/properties.constants';

interface PropertiesStore {
    // State
    properties: PropertySummary[];
    nearbyProperties: PropertyWithDistance[];
    currentProperty: Property | null;
    characteristics: Characteristic[];
    characteristicTypes: CharacteristicType[];
    groupedCharacteristics: Record<string, Characteristic[]>;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalElements: number;
    };
    nearbyPagination: {
        currentPage: number;
        totalPages: number;
        totalElements: number;
    };
    loading: boolean;
    error: string | null;
    searchQuery: string;
    currentFilters: SearchFilters | null;

    // Actions
    fetchProperties: (page?: number, size?: number) => Promise<void>;
    searchProperties: (filters: SearchFilters) => Promise<void>;
    fetchNearbyProperties: (filters: NearbySearchFilters) => Promise<void>;
    fetchPropertyById: (id: string) => Promise<void>;
    fetchCharacteristics: () => Promise<void>;
    fetchCharacteristicTypes: () => Promise<void>;
    groupCharacteristicsByType: () => Promise<void>;

    // State helpers
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSearchQuery: (query: string) => void;
    setCurrentFilters: (filters: SearchFilters | null) => void;
    resetCurrentProperty: () => void;
    clearProperties: () => void;
    clearNearbyProperties: () => void;

    // Computed properties
    getActiveProperties: () => PropertySummary[];
    getPropertyById: (id: string) => PropertySummary | undefined;
    getPropertyStatusInfo: (status: string) => { label: string; color: string };
}

export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
    // Initial state
    properties: [],
    nearbyProperties: [],
    currentProperty: null,
    characteristics: [],
    characteristicTypes: [],
    groupedCharacteristics: {},
    pagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0
    },
    nearbyPagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0
    },
    loading: false,
    error: null,
    searchQuery: '',
    currentFilters: null,

    // Actions
    fetchProperties: async (page = 0, size = 12) => {
        set({ loading: true, error: null });
        try {
            const response = await PropertiesService.getAllProperties(page, size);
            set({
                properties: response.content,
                pagination: {
                    currentPage: response.number,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements
                },
                loading: false,
                currentFilters: null
            });
        } catch (error: any) {
            set({
                error: error.message,
                loading: false
            });
            throw error;
        }
    },

    searchProperties: async (filters: SearchFilters) => {
        set({ loading: true, error: null });
        try {
            const response = await PropertiesService.searchProperties(filters);
            set({
                properties: response.content,
                pagination: {
                    currentPage: response.number,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements
                },
                loading: false,
                currentFilters: filters
            });
        } catch (error: any) {
            set({
                error: error.message,
                loading: false
            });
            throw error;
        }
    },

    fetchNearbyProperties: async (filters: NearbySearchFilters) => {
        set({ loading: true, error: null });
        try {
            const response = await PropertiesService.getNearbyProperties(filters);
            set({
                nearbyProperties: response.content,
                nearbyPagination: {
                    currentPage: response.number,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements
                },
                loading: false
            });
        } catch (error: any) {
            set({
                error: error.message,
                loading: false
            });
            throw error;
        }
    },

    fetchPropertyById: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const property = await PropertiesService.getPropertyById(id);
            set({
                currentProperty: property,
                loading: false
            });
        } catch (error: any) {
            set({
                error: error.message,
                loading: false
            });
            throw error;
        }
    },

    fetchCharacteristics: async () => {
        set({ loading: true, error: null });
        try {
            const characteristics = await PropertiesService.getAllCharacteristics();
            set({
                characteristics,
                loading: false
            });
        } catch (error: any) {
            set({
                error: error.message,
                loading: false
            });
            throw error;
        }
    },

    fetchCharacteristicTypes: async () => {
        set({ loading: true, error: null });
        try {
            const characteristicTypes = await PropertiesService.getCharacteristicTypes();
            set({
                characteristicTypes,
                loading: false
            });
        } catch (error: any) {
            set({
                error: error.message,
                loading: false
            });
            throw error;
        }
    },

    groupCharacteristicsByType: async () => {
        try {
            const grouped = await PropertiesService.getCharacteristicsGroupedByType();
            set({ groupedCharacteristics: grouped });
        } catch (error: any) {
            console.error('Failed to group characteristics:', error);
            set({ error: error.message });
        }
    },

    // State helpers
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCurrentFilters: (filters) => set({ currentFilters: filters }),
    resetCurrentProperty: () => set({ currentProperty: null }),
    clearProperties: () => set({ properties: [] }),
    clearNearbyProperties: () => set({ nearbyProperties: [] }),

    // Computed properties
    getActiveProperties: () => {
        const { properties } = get();
        return properties.filter(p =>
            PropertyStatusHelper.isPubliclyVisible(p.status)
        );
    },

    getPropertyById: (id: string) => {
        const { properties } = get();
        return properties.find(p => p.propertyId === id);
    },

    getPropertyStatusInfo: (status: string) => {
        // Default for unknown status
        const defaultInfo = { label: status, color: 'gray' };

        // Define theme colors locally
        const themeColors: Record<string, string> = {
            DRAFT: 'gray',
            PENDING: 'orange',
            ACTIVE: 'green',
            HIDDEN: 'blue',
            DELETED: 'red'
        };

        const label = PROPERTY_STATUS_LABELS[status as keyof typeof PROPERTY_STATUS_LABELS] || status;
        const color = themeColors[status] || 'gray';

        return { label, color };
    }
}));