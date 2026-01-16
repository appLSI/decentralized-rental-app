// src/features/host/types/host.types.ts
import {
    Property,
    PropertyType,
    PropertyStatus
} from "@/features/properties/types/properties.types";

// ==================== CREATE & UPDATE TYPES ====================

export interface CreatePropertyInput {
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
    characteristics: CharacteristicInput[]; // Array of { id: number }
    suggestedPrice?: number; // Optional AI-suggested price
}

export interface PropertyFormData extends Omit<CreatePropertyInput, 'characteristics'> {
    characteristics?: CharacteristicInput[]; // Make optional for form
    rawImages?: File[];
    suggestedPrice?: number; // AI-suggested price
}

export interface CharacteristicInput {
    id: number;
}

export interface UpdatePropertyInput {
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
    characteristics?: CharacteristicInput[];
}

// ==================== RESPONSE TYPES ====================

export interface PropertyCreateResponse {
    message: string;
    property: Property;
}

export interface PropertyActionResponse {
    propertyId: string;
    status: PropertyStatus;
    message: string;
}

export interface ImageUploadResponse {
    message: string;
    imagePaths: string[];
}

export interface PropertyCountResponse {
    count: number;
}

// ==================== IMAGE UPLOAD TYPES ====================

export interface ImageUploadData {
    propertyId: string;
    images: File[];
}

// ==================== STATUS DISPLAY TYPES ====================

export interface StatusDisplayInfo {
    label: string;
    description: string;
}

// ==================== PRICE PREDICTION TYPES ====================

export interface PricePredictionRequest {
    nb_of_guests: number;
    nb_of_bedrooms: number;
    nb_of_beds: number;
    nb_of_bathrooms: number;
    country: string;
    city: string;
    type: string;
}

export interface PricePredictionResponse {
    suggested_price: number;
    yield_optimized_15: number;
}

// ==================== TRANSITION TYPES ====================

export interface StatusTransition {
    from: PropertyStatus;
    to: PropertyStatus;
    label: string;
    description: string;
    allowed: boolean;
}
