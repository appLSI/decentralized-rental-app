// src/features/host/services/host.services.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import {
    Property,
    PropertyStatus
} from "@/features/properties/types/properties.types";
import {
    CreatePropertyInput,
    UpdatePropertyInput,
    PropertyCreateResponse,
    PropertyActionResponse,
    PropertyCountResponse,
    ImageUploadResponse
} from "../types/host.types";
import { PROPERTY_VALIDATION, PROPERTY_STATUS_DETAILS } from "@/constants/host.constants";

export const HostService = {
    // ==================== HOST ENDPOINTS (Property Owner) ====================

    /**
     * 5. CREATE A NEW PROPERTY
     * POST /api/listings/properties
     * 
     * Business Logic:
     * - Requires connected wallet (403 if not)
     * - Requires HOST role
     * - Initial status: DRAFT
     * - UUID generated for propertyId
     * - Owner association via JWT X-User-Id
     */
    createProperty: async (propertyData: CreatePropertyInput): Promise<PropertyCreateResponse> => {
        try {
            // Validate before sending
            const validationErrors = validateCreatePropertyData(propertyData);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors[0].message);
            }

            const response = await privateApiClient.post('/listings/properties', propertyData);
            return response.data;
        } catch (error: any) {
            console.error("Failed to create property:", error);

            if (error.response?.status === 403) {
                throw new Error("You must connect your wallet to create a property");
            }

            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes("Description")) {
                    throw new Error("Description must be between 50 and 2000 characters");
                }
                if (errorMessage.includes("wallet")) {
                    throw new Error("Please connect your wallet first");
                }
                throw new Error(errorMessage || "Validation failed");
            }

            throw new Error(error?.response?.data?.message || "Failed to create property");
        }
    },

    /**
     * 6. GET MY PROPERTIES
     * GET /api/listings/properties/my-properties
     * 
     * Business Logic:
     * - Returns all properties EXCEPT DELETED
     * - Includes: DRAFT, PENDING, ACTIVE, HIDDEN
     * - Uses X-User-Id from JWT
     * - Sorted by createdAt DESC
     */
    getMyProperties: async (): Promise<Property[]> => {
        try {
            const response = await privateApiClient.get('/listings/properties/my-properties');
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch my properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch your properties");
        }
    },

    /**
     * 7. UPDATE A PROPERTY
     * PUT /api/listings/properties/{propertyId}
     * 
     * Business Logic:
     * - Only owner can update
     * - Editable if status.isEditable() = DRAFT or PENDING
     * - Limited updates for ACTIVE properties
     * - lastUpdateAt updated automatically
     */
    updateProperty: async (
        propertyId: string,
        updateData: UpdatePropertyInput
    ): Promise<Property> => {
        try {
            const response = await privateApiClient.put(
                `/listings/properties/${propertyId}`,
                updateData
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error("You are not the owner of this property");
            }
            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes("Cannot edit")) {
                    throw new Error("This property cannot be edited in its current state");
                }
                throw new Error(errorMessage || "Invalid update data");
            }
            if (error.response?.status === 404) {
                throw new Error("Property not found");
            }
            console.error("Failed to update property:", error);
            throw new Error(error?.response?.data?.message || "Failed to update property");
        }
    },

    /**
     * 8. SUBMIT PROPERTY FOR VALIDATION
     * POST /api/listings/properties/{propertyId}/submit
     * 
     * Business Logic:
     * - Must be DRAFT status
     * - Must be owner
     * - Property must be complete (description, images, etc.)
     * - Transition: DRAFT → PENDING
     */
    submitProperty: async (propertyId: string): Promise<PropertyActionResponse> => {
        try {
            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/submit`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const errorMessage = error.response.data.error || error.response.data.message;
                if (errorMessage.includes("Only DRAFT properties")) {
                    const currentStatus = errorMessage.split(': ')[1] || 'UNKNOWN';
                    throw new Error(`Only DRAFT properties can be submitted. Current status: ${currentStatus}`);
                }
                if (errorMessage.includes("complete")) {
                    throw new Error("Please complete all required fields before submitting");
                }
            }
            if (error.response?.status === 403) {
                throw new Error("You are not the owner of this property");
            }
            console.error("Failed to submit property:", error);
            throw new Error(error?.response?.data?.message || "Failed to submit property");
        }
    },

    /**
     * 9. HIDE A PROPERTY
     * POST /api/listings/properties/{propertyId}/hide
     * 
     * Business Logic:
     * - Must be ACTIVE status
     * - Transition: ACTIVE → HIDDEN
     * - Not visible in public searches
     * - Existing bookings remain valid
     */
    hideProperty: async (propertyId: string): Promise<PropertyActionResponse> => {
        try {
            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/hide`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error("Only ACTIVE properties can be hidden");
            }
            console.error("Failed to hide property:", error);
            throw new Error(error?.response?.data?.message || "Failed to hide property");
        }
    },

    /**
     * 10. SHOW A HIDDEN PROPERTY
     * POST /api/listings/properties/{propertyId}/show
     * 
     * Business Logic:
     * - Must be HIDDEN status
     * - Transition: HIDDEN → ACTIVE
     * - Becomes visible publicly
     */
    showProperty: async (propertyId: string): Promise<PropertyActionResponse> => {
        try {
            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/show`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error("Only HIDDEN properties can be shown");
            }
            console.error("Failed to show property:", error);
            throw new Error(error?.response?.data?.message || "Failed to show property");
        }
    },

    /**
     * 11. DELETE (SOFT DELETE) A PROPERTY
     * DELETE /api/listings/properties/{propertyId}
     * 
     * Business Logic:
     * - Soft delete only
     * - Status: [ANY] → DELETED
     * - Cannot delete if active bookings (409)
     * - Remains in database
     * - Images NOT deleted from storage
     */
    deleteProperty: async (propertyId: string): Promise<PropertyActionResponse> => {
        try {
            const response = await privateApiClient.delete(
                `/listings/properties/${propertyId}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error("Cannot delete property with active bookings");
            }
            if (error.response?.status === 403) {
                throw new Error("You are not the owner of this property");
            }
            console.error("Failed to delete property:", error);
            throw new Error(error?.response?.data?.message || "Failed to delete property");
        }
    },

    /**
     * 12A. COUNT PROPERTIES FOR OWNER (Non-Deleted)
     * GET /api/listings/properties/owner/{ownerId}/count
     * 
     * Business Logic:
     * - Counts: DRAFT + PENDING + ACTIVE + HIDDEN
     * - Excludes: DELETED
     */
    getOwnerPropertiesCount: async (ownerId: string): Promise<PropertyCountResponse> => {
        try {
            const response = await privateApiClient.get(
                `/listings/properties/owner/${ownerId}/count`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to count owner properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to count properties");
        }
    },

    /**
     * 12B. COUNT ACTIVE PROPERTIES FOR OWNER
     * GET /api/listings/properties/owner/{ownerId}/active-count
     * 
     * Business Logic:
     * - Counts ONLY: ACTIVE
     * - Used by Auth Service for wallet disconnect validation
     */
    getOwnerActivePropertiesCount: async (ownerId: string): Promise<PropertyCountResponse> => {
        try {
            const response = await privateApiClient.get(
                `/listings/properties/owner/${ownerId}/active-count`
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to count active properties:", error);
            throw new Error(error?.response?.data?.message || "Failed to count active properties");
        }
    },

    // ==================== IMAGE MANAGEMENT ====================

    /**
     * UPLOAD PROPERTY IMAGES
     * POST /api/listings/properties/{propertyId}/images
     * Content-Type: multipart/form-data
     * 
     * Business Logic:
     * - Upload images AFTER property creation
     * - Max 10 files per upload
     * - Max 10MB per file
     * - Max 50MB total per request
     * - Only image/* types
     */
    uploadPropertyImages: async (
        propertyId: string,
        images: File[]
    ): Promise<ImageUploadResponse> => {
        try {
            // Validate images before upload
            const validationError = validateImages(images);
            if (validationError) {
                throw new Error(validationError);
            }

            const formData = new FormData();
            images.forEach((image, index) => {
                formData.append('images', image);
            });

            const response = await privateApiClient.post(
                `/listings/properties/${propertyId}/images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error("Failed to upload images:", error);

            if (error.response?.status === 400) {
                const errorMessage = error.response.data.message || '';
                if (errorMessage.includes("maximum") || errorMessage.includes("10")) {
                    throw new Error("Maximum 10 images per property");
                }
                if (errorMessage.includes("size") || errorMessage.includes("10MB")) {
                    throw new Error("Maximum file size is 10MB");
                }
                if (errorMessage.includes("type") || errorMessage.includes("image")) {
                    throw new Error("Only JPEG, PNG, and WebP images are allowed");
                }
            }

            throw new Error(error?.response?.data?.message || "Failed to upload images");
        }
    },

    // ==================== STATUS HELPER METHODS ====================

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
            DELETED: []
        };
        return transitions[current]?.includes(newStatus) ?? false;
    },

    getAllowedTransitions: (currentStatus: PropertyStatus): PropertyStatus[] => {
        const transitions: Record<PropertyStatus, PropertyStatus[]> = {
            DRAFT: ['PENDING', 'DELETED'],
            PENDING: ['ACTIVE', 'DRAFT', 'DELETED'],
            ACTIVE: ['HIDDEN', 'DELETED'],
            HIDDEN: ['ACTIVE', 'DELETED'],
            DELETED: []
        };
        return transitions[currentStatus] || [];
    },

    getStatusDisplayInfo: (status: PropertyStatus) => {
        return PROPERTY_STATUS_DETAILS[status] || { label: status, description: '' };
    }
};

// ==================== VALIDATION HELPERS ====================

interface ValidationError {
    field: string;
    message: string;
}

const validateCreatePropertyData = (data: CreatePropertyInput): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Title validation
    if (data.title.length < PROPERTY_VALIDATION.TITLE.MIN_LENGTH) {
        errors.push({ field: 'title', message: PROPERTY_VALIDATION.TITLE.ERROR_MIN });
    }
    if (data.title.length > PROPERTY_VALIDATION.TITLE.MAX_LENGTH) {
        errors.push({ field: 'title', message: PROPERTY_VALIDATION.TITLE.ERROR_MAX });
    }

    // Description validation (CRITICAL)
    if (data.description.length < PROPERTY_VALIDATION.DESCRIPTION.MIN_LENGTH) {
        errors.push({ field: 'description', message: PROPERTY_VALIDATION.DESCRIPTION.ERROR_MIN });
    }
    if (data.description.length > PROPERTY_VALIDATION.DESCRIPTION.MAX_LENGTH) {
        errors.push({ field: 'description', message: PROPERTY_VALIDATION.DESCRIPTION.ERROR_MAX });
    }

    // Price validation
    if (data.pricePerNight < PROPERTY_VALIDATION.PRICE.MIN) {
        errors.push({ field: 'pricePerNight', message: PROPERTY_VALIDATION.PRICE.ERROR });
    }

    // Guests validation
    if (data.nbOfGuests < PROPERTY_VALIDATION.GUESTS.MIN) {
        errors.push({ field: 'nbOfGuests', message: PROPERTY_VALIDATION.GUESTS.ERROR });
    }

    // Rooms validation
    if (data.nbOfBedrooms < 0 || data.nbOfBeds < 0 || data.nbOfBathrooms < 0) {
        errors.push({ field: 'capacity', message: PROPERTY_VALIDATION.ROOMS.ERROR });
    }

    // Coordinates validation
    if (data.latitude < PROPERTY_VALIDATION.COORDINATES.LATITUDE.MIN ||
        data.latitude > PROPERTY_VALIDATION.COORDINATES.LATITUDE.MAX) {
        errors.push({ field: 'latitude', message: PROPERTY_VALIDATION.COORDINATES.LATITUDE.ERROR });
    }
    if (data.longitude < PROPERTY_VALIDATION.COORDINATES.LONGITUDE.MIN ||
        data.longitude > PROPERTY_VALIDATION.COORDINATES.LONGITUDE.MAX) {
        errors.push({ field: 'longitude', message: PROPERTY_VALIDATION.COORDINATES.LONGITUDE.ERROR });
    }

    return errors;
};

const validateImages = (images: File[]): string | null => {
    // Check number of files
    if (images.length > PROPERTY_VALIDATION.IMAGES.MAX_FILES) {
        return PROPERTY_VALIDATION.IMAGES.ERROR_MAX_FILES;
    }

    let totalSize = 0;

    for (const image of images) {
        // Check file type
        if (!(PROPERTY_VALIDATION.IMAGES.ALLOWED_TYPES as readonly string[]).includes(image.type)) {
            return PROPERTY_VALIDATION.IMAGES.ERROR_FILE_TYPE;
        }

        // Check individual file size
        if (image.size > PROPERTY_VALIDATION.IMAGES.MAX_SIZE_PER_FILE) {
            return PROPERTY_VALIDATION.IMAGES.ERROR_FILE_SIZE;
        }

        totalSize += image.size;
    }

    // Check total size
    if (totalSize > PROPERTY_VALIDATION.IMAGES.MAX_TOTAL_SIZE) {
        return PROPERTY_VALIDATION.IMAGES.ERROR_TOTAL_SIZE;
    }

    return null;
};