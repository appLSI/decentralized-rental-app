// src/hooks/useAdminStore.ts
import { create } from 'zustand';
import { AdminService } from '@/features/admin/services/admin.service';
import {
    AgentData,
    CreateAgentInput,
    AdminPropertyData,
    PaginatedResponse,
    RejectionReason
} from '@/features/admin/types/admin.types';

interface AdminStore {
    agents: AgentData[];
    pendingProperties: AdminPropertyData[];
    pendingPropertiesPagination: {
        currentPage: number;
        totalPages: number;
        totalElements: number;
    };
    loading: boolean;
    error: string | null;

    // Agent Management
    fetchAgents: () => Promise<AgentData[]>;
    createAgent: (data: CreateAgentInput) => Promise<AgentData>;
    deleteAgent: (agentId: string) => Promise<void>;

    // Property Management
    fetchPendingProperties: (page?: number, size?: number) => Promise<PaginatedResponse<AdminPropertyData>>;
    validateProperty: (propertyId: string) => Promise<AdminPropertyData>;
    rejectProperty: (propertyId: string, reason?: RejectionReason) => Promise<AdminPropertyData>;

    // State management
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
    agents: [],
    pendingProperties: [],
    pendingPropertiesPagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    },
    loading: false,
    error: null,

    fetchAgents: async () => {
        set({ loading: true, error: null });
        try {
            const agents = await AdminService.fetchAgents();
            set({ agents, loading: false });
            return agents;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    createAgent: async (data: CreateAgentInput) => {
        set({ loading: true, error: null });
        try {
            const newAgent = await AdminService.createAgent(data);
            // Re-fetch agents to ensure we have the correct data structure and list
            await get().fetchAgents();
            set({ loading: false });
            return newAgent;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteAgent: async (agentId: string) => {
        set({ loading: true, error: null });
        try {
            await AdminService.deleteAgent(agentId);
            set((state) => ({
                agents: state.agents.filter(agent => agent.userId !== agentId),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchPendingProperties: async (page = 0, size = 20) => {
        set({ loading: true, error: null });
        try {
            const response = await AdminService.fetchPendingProperties(page, size);
            set({
                pendingProperties: response.content,
                pendingPropertiesPagination: {
                    currentPage: response.number,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements,
                },
                loading: false
            });
            return response;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    validateProperty: async (propertyId: string) => {
        set({ loading: true, error: null });
        try {
            const validatedProperty = await AdminService.validateProperty(propertyId);
            set((state) => ({
                pendingProperties: state.pendingProperties.filter(
                    property => property.propertyId !== propertyId
                ),
                loading: false
            }));
            return validatedProperty;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    rejectProperty: async (propertyId: string, reason?: RejectionReason) => {
        set({ loading: true, error: null });
        try {
            const rejectedProperty = await AdminService.rejectProperty(propertyId, reason);
            set((state) => ({
                pendingProperties: state.pendingProperties.filter(
                    property => property.propertyId !== propertyId
                ),
                loading: false
            }));
            return rejectedProperty;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));