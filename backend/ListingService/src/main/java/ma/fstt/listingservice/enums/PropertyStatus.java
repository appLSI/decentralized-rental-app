package ma.fstt.listingservice.enums;

/**
 * Statut d'une propriété dans le système
 */
public enum PropertyStatus {

    /**
     * Brouillon - propriété en cours de création, non visible publiquement
     */
    DRAFT("Brouillon", "Property is being created and not yet submitted"),

    /**
     * En attente de validation - propriété soumise, attend validation admin
     */
    PENDING_VALIDATION("En attente", "Property submitted and awaiting admin validation"),

    /**
     * Validée et active - propriété approuvée et visible publiquement
     */
    ACTIVE("Active", "Property is validated and publicly visible"),

    /**
     * Cachée - propriété validée mais temporairement cachée par le propriétaire
     */
    HIDDEN("Cachée", "Property is hidden by owner but still validated"),

    /**
     * Rejetée - propriété rejetée par l'admin
     */
    REJECTED("Rejetée", "Property was rejected during validation"),

    /**
     * Désactivée - propriété désactivée par le propriétaire
     */
    INACTIVE("Inactive", "Property is deactivated by owner"),

    /**
     * Supprimée - soft delete
     */
    DELETED("Supprimée", "Property is soft deleted");

    private final String displayName;
    private final String description;

    PropertyStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Détermine le statut à partir des anciens champs boolean
     * Utilisé pour la migration
     */
    public static PropertyStatus fromBooleanFlags(Boolean isDraft, Boolean isValidated,
                                                  Boolean isHidden, Boolean isDeleted) {
        // Priorité: DELETED > DRAFT > HIDDEN > ACTIVE/PENDING
        if (Boolean.TRUE.equals(isDeleted)) {
            return DELETED;
        }

        if (Boolean.TRUE.equals(isDraft)) {
            return DRAFT;
        }

        if (Boolean.TRUE.equals(isValidated)) {
            if (Boolean.TRUE.equals(isHidden)) {
                return HIDDEN;
            }
            return ACTIVE;
        }

        // Non validée et non brouillon = en attente
        return PENDING_VALIDATION;
    }

    /**
     * Vérifie si la propriété est visible publiquement
     */
    public boolean isPubliclyVisible() {
        return this == ACTIVE;
    }

    /**
     * Vérifie si la propriété peut être modifiée
     */
    public boolean isEditable() {
        return this == DRAFT || this == PENDING_VALIDATION || this == REJECTED;
    }

    /**
     * Vérifie si la propriété peut être réactivée
     */
    public boolean canBeReactivated() {
        return this == HIDDEN || this == INACTIVE;
    }
}