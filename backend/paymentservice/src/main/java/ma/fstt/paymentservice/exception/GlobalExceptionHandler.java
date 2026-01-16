package ma.fstt.paymentservice.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestionnaire global des exceptions pour retourner des réponses HTTP cohérentes
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Erreur de validation de paiement (wrapper)
     */
    @ExceptionHandler(PaymentValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(PaymentValidationException ex) {
        log.error("Payment validation error: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "VALIDATION_FAILED",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Transaction non trouvée ou pas encore minée
     */
    @ExceptionHandler(TransactionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTxNotFound(TransactionNotFoundException ex) {
        log.error("Transaction not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "TRANSACTION_NOT_FOUND",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Transaction échouée on-chain
     */
    @ExceptionHandler(TransactionFailedException.class)
    public ResponseEntity<ErrorResponse> handleTxFailed(TransactionFailedException ex) {
        log.error("Transaction failed: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "TRANSACTION_FAILED",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Contrat invalide (mauvaise adresse)
     */
    @ExceptionHandler(InvalidContractException.class)
    public ResponseEntity<ErrorResponse> handleInvalidContract(InvalidContractException ex) {
        log.error("Invalid contract: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "INVALID_CONTRACT",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Événement Funded non trouvé
     */
    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEventNotFound(EventNotFoundException ex) {
        log.error("Event not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "EVENT_NOT_FOUND",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Montant incorrect
     */
    @ExceptionHandler(AmountMismatchException.class)
    public ResponseEntity<ErrorResponse> handleAmountMismatch(AmountMismatchException ex) {
        log.error("Amount mismatch: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "AMOUNT_MISMATCH",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * État du contrat invalide
     */
    @ExceptionHandler(InvalidContractStateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidState(InvalidContractStateException ex) {
        log.error("Invalid contract state: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "INVALID_CONTRACT_STATE",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Paiement non trouvé en base
     */
    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePaymentNotFound(PaymentNotFoundException ex) {
        log.error("Payment not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "PAYMENT_NOT_FOUND",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Non autorisé
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        log.error("Unauthorized access: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        ex.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * Erreurs de validation Bean Validation (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.error("Validation errors: {}", errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ValidationErrorResponse(
                        "VALIDATION_ERROR",
                        "Invalid request parameters",
                        errors,
                        LocalDateTime.now()
                ));
    }

    /**
     * Erreur générique
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericError(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        "INTERNAL_ERROR",
                        "An unexpected error occurred. Please contact support if the issue persists.",
                        LocalDateTime.now()
                ));
    }
}

/**
 * Format de réponse d'erreur standard
 */
@Data
@AllArgsConstructor
class ErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp;
}

/**
 * Format de réponse pour les erreurs de validation
 */
@Data
@AllArgsConstructor
class ValidationErrorResponse {
    private String code;
    private String message;
    private Map<String, String> fieldErrors;
    private LocalDateTime timestamp;
}