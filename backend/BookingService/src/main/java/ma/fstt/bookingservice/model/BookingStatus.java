package ma.fstt.bookingservice.model;

/**
 * Booking State Machine:
 *
 * PENDING → AWAITING_PAYMENT → CONFIRMED
 *     ↓            ↓               ↓
 * CANCELLED    EXPIRED        CANCELLED
 *
 * PENDING: Initial validation (dates, wallet, availability)
 * AWAITING_PAYMENT: Snapshot saved, waiting for payment (15 min timeout)
 * CONFIRMED: Payment validated by PaymentService
 * CANCELLED: User cancellation or payment failure
 * EXPIRED: Payment timeout (auto-transition after 15 min)
 */
public enum BookingStatus {
    PENDING,           // Transitoire : validation en cours
    AWAITING_PAYMENT,  // État stable : snapshot pris, en attente de paiement
    CONFIRMED,         // État final : paiement validé
    CANCELLED,         // État final : annulation manuelle
    EXPIRED            // État final : timeout de paiement
}