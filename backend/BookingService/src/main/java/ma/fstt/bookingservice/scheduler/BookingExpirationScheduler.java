package ma.fstt.bookingservice.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.bookingservice.model.Booking;
import ma.fstt.bookingservice.model.BookingStatus;
import ma.fstt.bookingservice.repository.BookingRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingExpirationScheduler {

    private final BookingRepository bookingRepository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange:booking.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.expired:booking.expired}")
    private String expiredRoutingKey;

    /**
     * Vérifie toutes les 2 minutes les réservations en attente de paiement
     * qui ont été créées il y a plus de 15 minutes.
     */
    @Scheduled(fixedDelay = 120000) // 120000ms = 2 minutes
    @Transactional
    public void expireUnpaidBookings() {
        log.debug("⏰ Checking for expired bookings...");

        // 1. Définir le seuil d'expiration (Maintenant - 15 minutes)
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(15);

        // 2. Récupérer les réservations à expirer
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.AWAITING_PAYMENT,
                expirationThreshold
        );

        if (expiredBookings.isEmpty()) {
            return;
        }

        log.info("Found {} bookings to expire (created before {})", expiredBookings.size(), expirationThreshold);

        // 3. Mettre à jour les statuts en mémoire
        expiredBookings.forEach(booking -> {
            booking.setStatus(BookingStatus.EXPIRED);
            log.info("⏰ Booking {} expired (no payment in 15 min)", booking.getId());
        });

        // 4. Batch Update en base de données (Performance)
        bookingRepository.saveAll(expiredBookings);

        // 5. Publier les événements (Pour que SearchService libère les dates immédiatement)
        expiredBookings.forEach(this::publishExpiredEvent);
    }

    private void publishExpiredEvent(Booking booking) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("bookingId", booking.getId());
            event.put("propertyId", booking.getPropertyId());
            event.put("reason", "Payment timeout (15 min)");
            event.put("timestamp", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend(exchange, expiredRoutingKey, event);
        } catch (Exception e) {
            log.error("Failed to publish expiration event for booking {}", booking.getId(), e);
        }
    }
}