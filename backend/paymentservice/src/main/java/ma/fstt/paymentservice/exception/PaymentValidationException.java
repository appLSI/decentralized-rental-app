package ma.fstt.paymentservice.exception;

public class PaymentValidationException extends RuntimeException {
    public PaymentValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}