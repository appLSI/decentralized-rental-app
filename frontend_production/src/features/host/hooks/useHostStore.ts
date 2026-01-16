// src/features/host/hooks/useHostStore.ts
import { create } from 'zustand';
import { HostService } from '../services/host.services';
import { Property, PropertyStatus } from '@/features/properties/types/properties.types';
import {
    CreatePropertyInput,
    UpdatePropertyInput
} from '../types/host.types';
import { PROPERTY_STATUS_DETAILS } from '@/constants/host.constants';

interface HostStore {
    // State
    myProperties: Property[];
    loading: boolean;
    error: string | null;
    totalPropertiesCount: number | null;
    activePropertiesCount: number | null;
    currentProperty: Property | null;

    // Actions
    fetchMyProperties: () => Promise<void>;
    fetchProperty: (id: string) => Promise<void>;
    createProperty: (data: CreatePropertyInput) => Promise<Property>;
    updateProperty: (id: string, data: UpdatePropertyInput) => Promise<Property>;
    deleteProperty: (id: string) => Promise<void>;
    hideProperty: (id: string) => Promise<void>;
    showProperty: (id: string) => Promise<void>;
    submitProperty: (id: string) => Promise<void>;
    uploadPropertyImages: (id: string, images: File[]) => Promise<string[]>;
    fetchOwnerPropertiesCount: (ownerId: string) => Promise<void>;
    fetchOwnerActivePropertiesCount: (ownerId: string) => Promise<void>;

    // Status helpers
    isPropertyEditable: (status: PropertyStatus) => boolean;
    canSubmitProperty: (status: PropertyStatus) => boolean;
    getPropertyStatusInfo: (status: PropertyStatus) => { label: string; color: string; bgColor: string };

    // Clear state
    reset: () => void;
    clearError: () => void;
    setCurrentProperty: (property: Property | null) => void;
}

export const useHostStore = create<HostStore>((set, get) => ({
    myProperties: [],
    loading: false,
    error: null,
    totalPropertiesCount: null,
    activePropertiesCount: null,
    currentProperty: null,

    fetchMyProperties: async () => {
        set({ loading: true, error: null });
        try {
            const properties = await HostService.getMyProperties();
            set({ myProperties: properties, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchProperty: async (id: string) => {
        set({ loading: true, error: null });
        try {
            // Find in cached properties first
            const cached = get().myProperties.find(p => p.propertyId === id);
            if (cached) {
                set({ currentProperty: cached, loading: false });
                return;
            }

            // If not in cache, fetch from server
            // Note: This would require a new endpoint like GET /my-properties/{id}
            // For now, we'll search in the existing list
            set({ loading: false });
            throw new Error("Property not found in your properties");
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    createProperty: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await HostService.createProperty(data);
            // Add to local state
            set(state => ({
                myProperties: [response.property, ...state.myProperties],
                loading: false,
                currentProperty: response.property
            }));
            return response.property;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateProperty: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const updatedProperty = await HostService.updateProperty(id, data);
            // Update in local state
            set(state => ({
                myProperties: state.myProperties.map(p =>
                    p.propertyId === id ? updatedProperty : p
                ),
                currentProperty: updatedProperty,
                loading: false
            }));
            return updatedProperty;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.deleteProperty(id);
            // Remove from local state (soft delete - update status)
            set(state => ({
                myProperties: state.myProperties.map(p =>
                    p.propertyId === id ? { ...p, status: 'DELETED' } : p
                ),
                currentProperty: null,
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    hideProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.hideProperty(id);
            // Update local state
            await get().fetchMyProperties();
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    showProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.showProperty(id);
            // Update local state
            await get().fetchMyProperties();
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    submitProperty: async (id) => {
        set({ loading: true, error: null });
        try {
            await HostService.submitProperty(id);
            // Update local state
            set(state => ({
                myProperties: state.myProperties.map(p =>
                    p.propertyId === id ? { ...p, status: 'PENDING' } : p
                ),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    uploadPropertyImages: async (id, images) => {
        set({ loading: true, error: null });
        try {
            const response = await HostService.uploadPropertyImages(id, images);
            // Update property with new images
            set(state => ({
                myProperties: state.myProperties.map(p =>
                    p.propertyId === id
                        ? { ...p, imageFolderPath: [...(p.imageFolderPath || []), ...(response?.imagePaths || [])] }
                        : p
                ),
                loading: false
            }));
            return response?.imagePaths || [];
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchOwnerPropertiesCount: async (ownerId) => {
        try {
            const response = await HostService.getOwnerPropertiesCount(ownerId);
            set({ totalPropertiesCount: response.count });
        } catch (error: any) {
            console.error('Failed to fetch total properties count:', error);
        }
    },

    fetchOwnerActivePropertiesCount: async (ownerId) => {
        try {
            const response = await HostService.getOwnerActivePropertiesCount(ownerId);
            set({ activePropertiesCount: response.count });
        } catch (error: any) {
            console.error('Failed to fetch active properties count:', error);
        }
    },

    // Status helpers
    isPropertyEditable: (status) => HostService.isEditable(status),
    canSubmitProperty: (status) => status === 'DRAFT',
    getPropertyStatusInfo: (status) => {
        const details = PROPERTY_STATUS_DETAILS[status] || { label: status, description: '' };

        // Define theme colors locally in the store
        const themeColors: Record<string, { color: string; bgColor: string }> = {
            DRAFT: { color: 'text-gray-800', bgColor: 'bg-gray-100' },
            PENDING: { color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
            ACTIVE: { color: 'text-green-800', bgColor: 'bg-green-100' },
            HIDDEN: { color: 'text-blue-800', bgColor: 'bg-blue-100' },
            DELETED: { color: 'text-red-800', bgColor: 'bg-red-100' }
        };

        const theme = themeColors[status] || { color: 'text-gray-800', bgColor: 'bg-gray-100' };

        return {
            label: details.label,
            ...theme
        };
    },

    // Clear state
    reset: () => set({
        myProperties: [],
        loading: false,
        error: null,
        totalPropertiesCount: null,
        activePropertiesCount: null,
        currentProperty: null
    }),

    clearError: () => set({ error: null }),
    setCurrentProperty: (property) => set({ currentProperty: property })
}));