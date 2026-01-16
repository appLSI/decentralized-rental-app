// src/constants/host.constants.ts

export const PROPERTY_VALIDATION = {
    TITLE: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 100,
        ERROR_MIN: "Title must be at least 5 characters",
        ERROR_MAX: "Title cannot exceed 100 characters"
    },
    DESCRIPTION: {
        MIN_LENGTH: 50,     // ⚠️ CRITICAL
        MAX_LENGTH: 2000,
        ERROR_MIN: "Description must be at least 50 characters",
        ERROR_MAX: "Description cannot exceed 2000 characters"
    },
    PRICE: {
        MIN: 0.01,
        ERROR: "Price per night must be greater than 0"
    },
    GUESTS: {
        MIN: 1,
        ERROR: "Number of guests must be at least 1"
    },
    ROOMS: {
        MIN: 0,
        ERROR: "Cannot be negative"
    },
    COORDINATES: {
        LATITUDE: {
            MIN: -90,
            MAX: 90,
            ERROR: "Latitude must be between -90 and 90"
        },
        LONGITUDE: {
            MIN: -180,
            MAX: 180,
            ERROR: "Longitude must be between -180 and 180"
        }
    },
    IMAGES: {
        MAX_FILES: 10,
        MAX_SIZE_PER_FILE: 10 * 1024 * 1024, // 10MB
        MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ERROR_MAX_FILES: "Maximum 10 images per property",
        ERROR_FILE_SIZE: "Maximum file size is 10MB",
        ERROR_TOTAL_SIZE: "Total size cannot exceed 50MB",
        ERROR_FILE_TYPE: "Only JPEG, PNG, and WebP images are allowed"
    }
} as const;

export const PROPERTY_STATUS_DETAILS = {
    DRAFT: {
        label: 'Brouillon',
        description: 'You are working on this property'
    },
    PENDING: {
        label: 'En attente',
        description: 'Waiting for admin validation'
    },
    ACTIVE: {
        label: 'Actif',
        description: 'Visible to the public'
    },
    HIDDEN: {
        label: 'Caché',
        description: 'Hidden from public view'
    },
    DELETED: {
        label: 'Supprimé',
        description: 'Deleted (soft delete)'
    }
} as const;

export const ALLOWED_TRANSITIONS = [
    { from: 'DRAFT', to: 'PENDING', label: 'Submit for Review', description: 'Submit to admin for validation', allowed: true },
    { from: 'DRAFT', to: 'DELETED', label: 'Delete', description: 'Permanently delete', allowed: true },
    { from: 'PENDING', to: 'ACTIVE', label: 'Approve', description: 'Admin approval (admin only)', allowed: false },
    { from: 'PENDING', to: 'DRAFT', label: 'Return to Draft', description: 'Return for editing (admin only)', allowed: false },
    { from: 'PENDING', to: 'DELETED', label: 'Delete', description: 'Permanently delete', allowed: true },
    { from: 'ACTIVE', to: 'HIDDEN', label: 'Hide', description: 'Make temporarily invisible', allowed: true },
    { from: 'ACTIVE', to: 'DELETED', label: 'Delete', description: 'Permanently delete', allowed: true },
    { from: 'HIDDEN', to: 'ACTIVE', label: 'Show', description: 'Make visible again', allowed: true },
    { from: 'HIDDEN', to: 'DELETED', label: 'Delete', description: 'Permanently delete', allowed: true }
] as const;
