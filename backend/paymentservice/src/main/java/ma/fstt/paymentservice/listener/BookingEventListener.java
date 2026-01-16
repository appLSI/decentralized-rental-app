package ma.fstt.paymentservice.listener;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventListener {

    /**
     * ✅ NOUVEAU : Écoute les bookings créées
     * Envoie une notification ou prépare le payment intent
     */
    @RabbitListener(queues = "payment.booking-created.queue")
    public void handleBookingCreated(JsonNode bookingEvent) {
        try {
            Long bookingId = bookingEvent.get("id").asLong();
            String totalPrice = bookingEvent.get("totalPrice").asText();

            log.info("📬 New booking received: {} - Amount: {}",
                    bookingId, totalPrice);

            // TODO: Créer payment intent, envoyer notification, etc.

        } catch (Exception e) {
            log.error("❌ Error processing booking created event", e);
        }
    }
}