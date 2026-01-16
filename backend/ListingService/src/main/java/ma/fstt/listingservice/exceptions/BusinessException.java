package ma.fstt.listingservice.exceptions;

/**
 * Exception métier pour erreurs de logique business
 * (ex: wallet manquant, transition invalide, etc.)
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;

    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
    }

    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "BUSINESS_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }

    // Codes d'erreur spécifiques
    public static class WalletRequired extends BusinessException {
        public WalletRequired() {
            super("Owner must connect a wallet before activating property", "WALLET_REQUIRED");
        }
    }

    public static class InvalidStatusTransition extends BusinessException {
        public InvalidStatusTransition(String from, String to) {
            super(String.format("Invalid status transition: %s → %s", from, to),
                    "INVALID_TRANSITION");
        }
    }

    public static class PropertyNotEditable extends BusinessException {
        public PropertyNotEditable(String currentStatus) {
            super(String.format("Property in status %s cannot be edited", currentStatus),
                    "NOT_EDITABLE");
        }
    }

    public static class HasActiveBookings extends BusinessException {
        public HasActiveBookings() {
            super("Cannot delete or modify property with active bookings",
                    "ACTIVE_BOOKINGS");
        }
    }
}