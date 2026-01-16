// src/features/admin/services/admin.service.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import {
    AgentData,
    CreateAgentInput,
    AdminPropertyData,
    PaginatedResponse,
    RejectionReason
} from "../types/admin.types";

export const AdminService = {
    // ------------------ AGENT MANAGEMENT ------------------

    // Fetch all agents
    fetchAgents: async (): Promise<AgentData[]> => {
        try {
            const response = await privateApiClient.get("auth/users/admin/agents");
            return response.data as AgentData[];
        } catch (error: any) {
            console.error("Failed to fetch agents:", error?.response?.data || error);
            throw new Error(error?.response?.data?.message || "Failed to fetch agents");
        }
    },

    // Create a new agent
    createAgent: async (data: CreateAgentInput): Promise<AgentData> => {
        try {
            const response = await privateApiClient.post("auth/users/admin/agents", data);
            return response.data as AgentData;
        } catch (error: any) {
            console.error("Failed to create agent:", error?.response?.data || error);
            throw new Error(error?.response?.data?.message || "Failed to create agent");
        }
    },

    // Delete an agent
    deleteAgent: async (agentId: string): Promise<void> => {
        try {
            await privateApiClient.delete(`auth/users/admin/agents/${agentId}`);
        } catch (error: any) {
            console.error("Failed to delete agent:", error?.response?.data || error);
            throw new Error(error?.response?.data?.message || "Failed to delete agent");
        }
    },

    // ------------------ PROPERTY MANAGEMENT (LISTING SERVICE) ------------------

    // 13. List pending properties (Admin only)
    fetchPendingProperties: async (
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<AdminPropertyData>> => {
        try {
            const response = await privateApiClient.get("/listings/properties/pending", {
                params: { page, size }
            });
            return response.data as PaginatedResponse<AdminPropertyData>;
        } catch (error: any) {
            console.error("Failed to fetch pending properties:", error?.response?.data || error);
            throw new Error(error?.response?.data?.message || "Failed to fetch pending properties");
        }
    },

    // 14. Validate a pending property (Approve)
    validateProperty: async (propertyId: string): Promise<AdminPropertyData> => {
        try {
            const response = await privateApiClient.patch(
                `/listings/properties/${propertyId}/validate`
            );
            return response.data as AdminPropertyData;
        } catch (error: any) {
            console.error("Failed to validate property:", error?.response?.data || error);
            throw new Error(error?.response?.data?.message || "Failed to validate property");
        }
    },

    // 15. Reject a pending property
    rejectProperty: async (
        propertyId: string,
        reason?: RejectionReason
    ): Promise<AdminPropertyData> => {
        try {
            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/reject`,
                reason || {}
            );
            return response.data as AdminPropertyData;
        } catch (error: any) {
            console.error("Failed to reject property:", error?.response?.data || error);
            throw new Error(error?.response?.data?.message || "Failed to reject property");
        }
    },

    // ------------------ OPTIONAL: VIEW PROPERTY DETAILS AS ADMIN ------------------
    // (If you need admin access to view any property regardless of status)
    getPropertyDetails: async (propertyId: string): Promise<AdminPropertyData> => {
        try {
            const response = await privateApiClient.get(`/listings/properties/${propertyId}/admin`);
            return response.data as AdminPropertyData;
        } catch (error: any) {
            console.error("Failed to fetch property details:", error?.response?.data || error);
            throw new Error(error?.response?.data?.message || "Failed to fetch property details");
        }
    }
};