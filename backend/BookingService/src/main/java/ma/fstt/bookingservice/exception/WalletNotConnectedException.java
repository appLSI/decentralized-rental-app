package ma.fstt.bookingservice.exception;

/**
 * Exception lancée quand un utilisateur tente de créer une booking
 * sans avoir connecté son wallet dans AuthService
 */
public class WalletNotConnectedException extends RuntimeException {

    public WalletNotConnectedException(String message) {
        super(message);
    }

    public WalletNotConnectedException(String message, Throwable cause) {
        super(message, cause);
    }
}