package ma.fstt.bookingservice.listener;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.bookingservice.service.BookingService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * 🔒 LA VRAIE SOLUTION SÉCURISÉE
 *
 * Ce listener écoute les événements du PaymentService.
 * C'est LUI qui appelle confirmBooking(), pas le Frontend !
 *
 * Configuration RabbitMQ nécessaire :
 * - Queue: payment.confirmed.queue
 * - Exchange: payment.exchange
 * - Routing Key: payment.confirmed
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final BookingService bookingService;

    /**
     * Listener pour les paiements confirmés
     * Format du message attendu :
     * {
     *   "bookingId": 123,
     *   "transactionId": "0x123abc...",
     *   "amount": "150.00",
     *   "currency": "USDC",
     *   "status": "CONFIRMED"
     * }
     */
    @RabbitListener(queues = "${rabbitmq.queue.payment-confirmed}")
    public void handlePaymentConfirmed(JsonNode paymentEvent) {
        try {
            Long bookingId = paymentEvent.get("bookingId").asLong();
            String transactionId = paymentEvent.get("transactionId").asText();

            log.info("🔔 Payment confirmed for booking {} - Transaction: {}",
                    bookingId, transactionId);

            // ✅ Appel sécurisé interne (pas via HTTP)
            bookingService.confirmBooking(bookingId);

            log.info("✅ Booking {} successfully confirmed after payment validation", bookingId);

        } catch (Exception e) {
            log.error("❌ Error processing payment confirmation: {}", e.getMessage(), e);
            // TODO: Implémenter retry logic ou DLQ (Dead Letter Queue)
        }
    }

    /**
     * Listener pour les paiements échoués
     */
    @RabbitListener(queues = "${rabbitmq.queue.payment-failed}")
    public void handlePaymentFailed(JsonNode paymentEvent) {
        try {
            Long bookingId = paymentEvent.get("bookingId").asLong();
            String reason = paymentEvent.get("reason").asText();

            log.warn("⚠️ Payment failed for booking {} - Reason: {}", bookingId, reason);

            // Auto-annulation de la réservation
            bookingService.cancelBooking(bookingId);

            log.info("Booking {} auto-cancelled due to payment failure", bookingId);

        } catch (Exception e) {
            log.error("❌ Error processing payment failure: {}", e.getMessage(), e);
        }
    }
}