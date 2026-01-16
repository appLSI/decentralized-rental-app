package ma.fstt.listingservice.entities;

public enum PropertyStatus {
    DRAFT,       // Brouillon, owner travaille dessus
    PENDING,     // Soumis, en attente validation admin
    ACTIVE,      // Validé et visible
    HIDDEN,      // Validé mais caché temporairement
    DELETED;     // Supprimé définitivement

    /**
     * Vérifier si transition autorisée vers un autre status
     */
    public boolean canTransitionTo(PropertyStatus target) {
        return switch (this) {
            case DRAFT -> target == PENDING || target == DELETED;
            case PENDING -> target == ACTIVE || target == DRAFT || target == DELETED;
            case ACTIVE -> target == HIDDEN || target == DELETED;
            case HIDDEN -> target == ACTIVE || target == DELETED;
            case DELETED -> false; // Aucune transition depuis DELETED (état final)
        };
    }

    /**
     * Vérifier si property est visible publiquement (pour recherches)
     */
    public boolean isPubliclyVisible() {
        return this == ACTIVE;
    }

    /**
     * Vérifier si property peut accepter des bookings
     */
    public boolean canAcceptBookings() {
        return this == ACTIVE;
    }

    /**
     * Vérifier si owner peut éditer la property
     */
    public boolean isEditable() {
        return this == DRAFT || this == PENDING;
    }

    /**
     * Vérifier si property est supprimée
     */
    public boolean isDeleted() {
        return this == DELETED;
    }

    /**
     * Vérifier si property nécessite validation admin
     */
    public boolean needsValidation() {
        return this == PENDING;
    }
}