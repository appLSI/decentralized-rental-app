// src/features/admin/types/admin.types.ts

// ------------------ Agent Data ------------------
export interface AgentData {
    userId: string;         // Backend agent ID
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    roles: Array<"AGENT" | "USER">;
}

// ------------------ Property Data for Admin ------------------
export interface AdminPropertyData {
    propertyId: string;
    title: string;
    type: string;
    description: string;
    status: PropertyStatus;
    ownerId: string;
    ownerEmail?: string; // May be added if backend includes owner info
    pricePerNight: number;
    nbOfGuests: number;
    nbOfBedrooms: number;
    nbOfBeds: number;
    nbOfBathrooms: number;
    city: string;
    country: string;
    imageFolderPath: string[];
    characteristics: CharacteristicData[];
    createdAt: string;
    lastUpdateAt: string;
}

export interface CharacteristicData {
    id: number;
    name: string;
    iconPath: string;
}

export type PropertyStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'HIDDEN' | 'DELETED';

// ------------------ Paginated Response ------------------
export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

// ------------------ Rejection Reason ------------------
export interface RejectionReason {
    reason: string;
}

// ------------------ Admin State (optional) ------------------
export interface AdminState {
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
}

// ------------------ Create Agent Input ------------------
export interface CreateAgentInput {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone?: string;
}