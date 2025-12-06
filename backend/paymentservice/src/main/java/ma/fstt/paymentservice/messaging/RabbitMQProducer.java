package ma.fstt.paymentservice.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.paymentservice.domain.Payment;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Producer RabbitMQ pour publier les événements de paiement
 *
 * CRITICAL: Les clés JSON DOIVENT correspondre EXACTEMENT à PaymentEventListener
 * dans BookingService, notamment "transactionId" (PAS "transactionHash")
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.confirmed}")
    private String confirmedRoutingKey;

    @Value("${rabbitmq.routing-key.failed}")
    private String failedRoutingKey;

    /**
     * Publie un événement payment.confirmed
     *
     * ⚠️ CRITICAL: La clé JSON est "transactionId" (pas "transactionHash")
     * BookingService s'attend à ce nom de clé dans PaymentEventListener
     *
     * @param payment Payment confirmé
     */
    public void publishPaymentConfirmed(Payment payment) {

        Map<String, Object> payload = Map.of(
                "bookingId", payment.getBookingId(),
                "transactionId", payment.getTransactionHash(), // ← CRITICAL: Clé attendue par BookingService
                "amount", payment.getAmount().toString(),
                "currency", payment.getCurrency(),
                "fromAddress", payment.getFromAddress(),
                "blockNumber", payment.getBlockNumber(),
                "status", "CONFIRMED",
                "timestamp", LocalDateTime.now().toString()
        );

        try {
            rabbitTemplate.convertAndSend(exchange, confirmedRoutingKey, payload);

            log.info("📨 Published payment.confirmed event:");
            log.info("   Exchange: {}", exchange);
            log.info("   Routing Key: {}", confirmedRoutingKey);
            log.info("   Booking ID: {}", payment.getBookingId());
            log.info("   Transaction: {}", payment.getTransactionHash());

        } catch (Exception e) {
            log.error("❌ Failed to publish payment.confirmed event for booking {}: {}",
                    payment.getBookingId(), e.getMessage(), e);
            // Ne pas propager l'erreur - le paiement est déjà confirmé en DB
            // Le listener pourrait être réessayé via un retry mechanism
        }
    }

    /**
     * Publie un événement payment.failed
     *
     * @param payment Payment échoué
     * @param reason Raison de l'échec
     */
    public void publishPaymentFailed(Payment payment, String reason) {

        Map<String, Object> payload = Map.of(
                "bookingId", payment.getBookingId(),
                "transactionId", payment.getTransactionHash(), // ← Même clé pour cohérence
                "status", "FAILED",
                "reason", reason,
                "timestamp", LocalDateTime.now().toString()
        );

        try {
            rabbitTemplate.convertAndSend(exchange, failedRoutingKey, payload);

            log.info("📨 Published payment.failed event:");
            log.info("   Booking ID: {}", payment.getBookingId());
            log.info("   Reason: {}", reason);

        } catch (Exception e) {
            log.error("❌ Failed to publish payment.failed event for booking {}: {}",
                    payment.getBookingId(), e.getMessage(), e);
        }
    }
}