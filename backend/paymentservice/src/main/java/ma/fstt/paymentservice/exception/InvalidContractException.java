package ma.fstt.paymentservice.exception;

public class InvalidContractException extends RuntimeException {
    public InvalidContractException(String message) {
        super(message);
    }
}