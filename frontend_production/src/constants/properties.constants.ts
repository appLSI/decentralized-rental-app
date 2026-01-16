// src/constants/properties.constants.ts

export const PROPERTY_CONSTRAINTS = {
    TITLE: {
        MIN: 5,
        MAX: 100
    },
    DESCRIPTION: {
        MIN: 50,    // ⚠️ CRITICAL: 50 characters minimum
        MAX: 2000
    },
    PRICE: {
        MIN: 0.01  // > 0
    },
    CAPACITY: {
        MIN: 0
    },
    COORDINATES: {
        LATITUDE: { MIN: -90, MAX: 90 },
        LONGITUDE: { MIN: -180, MAX: 180 }
    }
};

export const IMAGE_CONSTRAINTS = {
    MAX_FILES: 10,
    MAX_SIZE_PER_FILE: 10 * 1024 * 1024, // 10MB
    MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const
};

export const PROPERTY_STATUS_LABELS = {
    DRAFT: 'Brouillon',
    PENDING: 'En attente',
    ACTIVE: 'Actif',
    HIDDEN: 'Caché',
    DELETED: 'Supprimé'
} as const;
