package ma.fstt.bookingservice.exception;

public class WalletMismatchException extends RuntimeException {
    public WalletMismatchException(String message) {
        super(message);
    }
}