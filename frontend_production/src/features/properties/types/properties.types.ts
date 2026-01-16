// src/features/properties/types/properties.types.ts
import { PROPERTY_CONSTRAINTS } from "@/constants/properties.constants";

// ==================== CORE PROPERTY TYPES ====================

export interface Property {
    // Core Information
    propertyId: string;
    title: string;
    type: PropertyType;
    description: string;

    // Location
    addressName: string;
    city: string;
    country: string;
    state?: string;
    codePostale?: string;
    latitude: number;
    longitude: number;

    // Pricing & Capacity
    pricePerNight: number;
    nbOfGuests: number;
    nbOfBedrooms: number;
    nbOfBeds: number;
    nbOfBathrooms: number;

    // Status & Ownership
    status: PropertyStatus;
    ownerId: string; // UUID from Auth Service (owner_user_id in DB)
    owner_id?: number; // FK to owners.id (optional in frontend)

    // Media
    imageFolderPath: string[];
    characteristics: Characteristic[];

    // Timestamps
    createdAt: string;
    lastUpdateAt: string;

    // For nearby search - ✅ ADDED based on docs
    distance?: number; // in kilometers
}

// ✅ Owner interface matches documentation exactly
export interface Owner {
    id: number;
    userId: string; // UUID from Auth Service
    walletAddress: string; // Ethereum address (42 chars)
}

export interface PropertySummary {
    propertyId: string;
    title: string;
    type: PropertyType;
    pricePerNight: number;
    city: string;
    country: string;
    addressName: string; // ✅ ADDED: For display in search results
    latitude: number;
    longitude: number;
    nbOfGuests: number;
    nbOfBedrooms: number;
    nbOfBeds: number;
    nbOfBathrooms: number;
    status: PropertyStatus;
    images: string[];
    characteristics: Characteristic[];
    ownerId: string;
    createdAt: string;
    lastUpdateAt: string;
    distance?: number; // ✅ ADDED: For nearby search results
}

// ✅ Characteristic interface matches database schema
export interface Characteristic {
    id: number;
    name: string;
    iconPath: string;
    isActive: boolean;
    typeCaracteristique_id: number; // DB field name
    typeCaracteristique?: CharacteristicType; // Optional nested object
}

export interface CharacteristicType {
    id: number;
    name: string;
    description?: string;
    iconPath?: string;
}

// ==================== ENUMS ====================

export type PropertyType =
    | 'VILLA'
    | 'APARTMENT'
    | 'HOUSE'
    | 'CONDO'
    | 'CABIN'
    | 'TINY_HOUSE'
    | 'CASTLE'
    | 'TREEHOUSE'
    | 'BOAT'
    | 'CAMPER'
    | string;

export type PropertyStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'ACTIVE'
    | 'HIDDEN'
    | 'DELETED';

// ==================== SEARCH & FILTER TYPES ====================

export interface SearchFilters {
    city?: string;
    type?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    nbOfGuests?: number;
    characteristics?: number[]; // Array of characteristic IDs
    page?: number;
    size?: number;
    sortBy?: SortByField;
    sortDir?: SortDirection;
}

export interface NearbySearchFilters {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers (default 10)
    page?: number;
    size?: number;
}

export type SortByField =
    | 'createdAt'
    | 'pricePerNight'
    | 'title'
    | 'lastUpdateAt';

export type SortDirection = 'ASC' | 'DESC';

// ==================== PAGINATION TYPES ====================

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

// ==================== CREATE & UPDATE TYPES ====================

// ✅ Create property DTO matches backend expectation exactly
export interface CreatePropertyDto {
    title: string;
    type: PropertyType;
    description: string; // ⚠️ 50-2000 characters REQUIRED
    addressName: string;
    city: string;
    country: string;
    state?: string;
    codePostale?: string;
    latitude: number; // -90 to 90
    longitude: number; // -180 to 180
    pricePerNight: number; // > 0
    nbOfGuests: number; // > 0
    nbOfBedrooms: number; // ≥ 0
    nbOfBeds: number; // ≥ 0
    nbOfBathrooms: number; // ≥ 0
    characteristics: CharacteristicIdDto[]; // Array of objects with id
}

// ✅ Update property DTO - all fields optional
export interface UpdatePropertyDto {
    title?: string;
    type?: PropertyType;
    description?: string;
    addressName?: string;
    city?: string;
    country?: string;
    state?: string;
    codePostale?: string;
    latitude?: number;
    longitude?: number;
    pricePerNight?: number;
    nbOfGuests?: number;
    nbOfBedrooms?: number;
    nbOfBeds?: number;
    nbOfBathrooms?: number;
    characteristics?: CharacteristicIdDto[];
}

// ✅ Characteristic ID DTO matches backend format
export interface CharacteristicIdDto {
    id: number;
}

// ==================== RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
    message: string;
    data?: T;
    property?: Property; // For create response
    count?: number; // For count endpoints
}

export interface ImageUploadResponse {
    message: string;
    imagePaths: string[];
}

export interface StatusChangeResponse {
    propertyId: string;
    status: PropertyStatus;
    message: string;
}


// ==================== STATUS HELPER TYPES ====================

export const PropertyStatusHelper = {
    isPubliclyVisible: (status: PropertyStatus): boolean => status === 'ACTIVE',

    canAcceptBookings: (status: PropertyStatus): boolean => status === 'ACTIVE',

    isEditable: (status: PropertyStatus): boolean => ['DRAFT', 'PENDING'].includes(status),

    isDeleted: (status: PropertyStatus): boolean => status === 'DELETED',

    needsValidation: (status: PropertyStatus): boolean => status === 'PENDING',

    canTransitionTo: (current: PropertyStatus, newStatus: PropertyStatus): boolean => {
        const transitions: Record<PropertyStatus, PropertyStatus[]> = {
            DRAFT: ['PENDING', 'DELETED'],
            PENDING: ['ACTIVE', 'DRAFT', 'DELETED'],
            ACTIVE: ['HIDDEN', 'DELETED'],
            HIDDEN: ['ACTIVE', 'DELETED'],
            DELETED: [] // No transitions from DELETED
        };
        return transitions[current]?.includes(newStatus) || false;
    },

    getValidNextStatuses: (current: PropertyStatus): PropertyStatus[] => {
        const transitions: Record<PropertyStatus, PropertyStatus[]> = {
            DRAFT: ['PENDING', 'DELETED'],
            PENDING: ['ACTIVE', 'DRAFT', 'DELETED'],
            ACTIVE: ['HIDDEN', 'DELETED'],
            HIDDEN: ['ACTIVE', 'DELETED'],
            DELETED: []
        };
        return transitions[current] || [];
    }
};


// ==================== ERROR TYPES ====================

export interface ApiErrorResponse {
    message: string;
    error?: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
    validationErrors?: Record<string, string[]>;
}

export interface ValidationError {
    field: string;
    message: string;
    rejectedValue?: any;
}

// ==================== UTILITY TYPES ====================

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface PropertyWithDistance extends Property {
    distance: number; // in kilometers
}

export interface OwnerStats {
    totalProperties: number;    // DRAFT + PENDING + ACTIVE + HIDDEN
    activeProperties: number;   // ACTIVE only
    draftProperties: number;    // DRAFT only
    pendingProperties: number;  // PENDING only
    hiddenProperties: number;   // HIDDEN only
}

export interface PropertyCountResponse {
    count: number;
}

// ==================== IMAGE STORAGE TYPES ====================

export type ImageStorageType = 'LOCAL' | 'S3';

export interface ImageStorageConfig {
    type: ImageStorageType;
    baseUrl?: string;
    localPath?: string;
}

// ==================== HELPER FUNCTIONS ====================

export const formatPrice = (price: number, currency: string = 'MAD'): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(price);
};

export const resolveImageUrl = (imagePath: string, baseUrl?: string): string => {
    if (!imagePath) return '/images/property-placeholder.jpg';

    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;

    // For S3 URLs or local paths
    return baseUrl ? `${baseUrl}/${imagePath}` : imagePath;
};

export const validateCreatePropertyData = (data: CreatePropertyDto): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Title validation
    if (data.title.length < PROPERTY_CONSTRAINTS.TITLE.MIN) {
        errors.push({
            field: 'title',
            message: `Title must be at least ${PROPERTY_CONSTRAINTS.TITLE.MIN} characters`
        });
    }

    if (data.title.length > PROPERTY_CONSTRAINTS.TITLE.MAX) {
        errors.push({
            field: 'title',
            message: `Title cannot exceed ${PROPERTY_CONSTRAINTS.TITLE.MAX} characters`
        });
    }

    // Description validation (CRITICAL)
    if (data.description.length < PROPERTY_CONSTRAINTS.DESCRIPTION.MIN) {
        errors.push({
            field: 'description',
            message: `Description must be at least ${PROPERTY_CONSTRAINTS.DESCRIPTION.MIN} characters`
        });
    }

    if (data.description.length > PROPERTY_CONSTRAINTS.DESCRIPTION.MAX) {
        errors.push({
            field: 'description',
            message: `Description cannot exceed ${PROPERTY_CONSTRAINTS.DESCRIPTION.MAX} characters`
        });
    }

    // Price validation
    if (data.pricePerNight <= 0) {
        errors.push({
            field: 'pricePerNight',
            message: 'Price per night must be greater than 0'
        });
    }

    // Capacity validation
    if (data.nbOfGuests <= 0) {
        errors.push({
            field: 'nbOfGuests',
            message: 'Number of guests must be greater than 0'
        });
    }

    if (data.nbOfBedrooms < 0 || data.nbOfBeds < 0 || data.nbOfBathrooms < 0) {
        errors.push({
            field: 'capacity',
            message: 'Bedrooms, beds, and bathrooms cannot be negative'
        });
    }

    // Coordinates validation
    if (data.latitude < -90 || data.latitude > 90) {
        errors.push({
            field: 'latitude',
            message: 'Latitude must be between -90 and 90'
        });
    }

    if (data.longitude < -180 || data.longitude > 180) {
        errors.push({
            field: 'longitude',
            message: 'Longitude must be between -180 and 180'
        });
    }

    return errors;
};