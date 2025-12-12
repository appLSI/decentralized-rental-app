package ma.fstt.bookingservice.controller;

import ma.fstt.bookingservice.dto.BookingRequestDTO;
import ma.fstt.bookingservice.dto.BookingResponseDTO;
import ma.fstt.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking
     * État créé : AWAITING_PAYMENT
     * Le frontend recevra le bookingId et totalPrice pour initier le paiement
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @RequestHeader(value = "X-User-Id", required = true) Long tenantId,
            @Valid @RequestBody BookingRequestDTO request
    ) {
        log.info("Received booking request from tenant {}", tenantId);
        BookingResponseDTO response = bookingService.createBooking(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ⚠️ ENDPOINT CRITIQUE - SÉCURITÉ REQUISE EN PRODUCTION ⚠️
     *
     * Cet endpoint NE DOIT PAS être accessible publiquement en production.
     *
     * Solutions recommandées :
     * 1. Le retirer complètement et utiliser uniquement RabbitMQ Listener
     * 2. Le protéger avec un API Key interne (X-Internal-Token)
     * 3. Le mettre sur un port différent (ex: 8081) non exposé à l'extérieur
     * 4. Vérifier que l'appel vient du PaymentService (IP whitelisting)
     *
     * Pour le MVP étudiant, on garde l'endpoint avec cette documentation
     * pour montrer la compréhension du problème de sécurité.
     *
     * Flow attendu :
     * Frontend → createBooking() → AWAITING_PAYMENT
     * PaymentService → confirmBooking() → CONFIRMED
     */
    @PatchMapping("/{bookingId}/confirm")
    public ResponseEntity<BookingResponseDTO> confirmBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-Internal-Token", required = false) String internalToken
    ) {
        // TODO: Valider le token interne en production
        // if (!"SECRET_INTERNAL_TOKEN".equals(internalToken)) {
        //     return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        // }

        log.warn("⚠️ CONFIRMING BOOKING {} - Should only be called by PaymentService", bookingId);
        BookingResponseDTO response = bookingService.confirmBooking(bookingId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel a booking (peut être appelé par l'utilisateur)
     */
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) Long tenantId
    ) {
        log.info("Cancelling booking {} by tenant {}", bookingId, tenantId);

        // TODO: Vérifier que l'utilisateur est le propriétaire de la réservation
        // BookingResponseDTO booking = bookingService.getBookingById(bookingId);
        // if (!booking.getTenantId().equals(tenantId)) {
        //     return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        // }

        BookingResponseDTO response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all bookings for the authenticated tenant
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @RequestHeader(value = "X-User-Id", required = true) Long tenantId
    ) {
        log.info("Fetching bookings for tenant {}", tenantId);
        List<BookingResponseDTO> bookings = bookingService.getBookingsByTenant(tenantId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a specific booking by ID
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) Long tenantId
    ) {
        log.info("Fetching booking {} by tenant {}", bookingId, tenantId);

        BookingResponseDTO booking = bookingService.getBookingById(bookingId);

        // TODO: Vérifier que l'utilisateur a le droit de voir cette réservation
        // if (!booking.getTenantId().equals(tenantId)) {
        //     return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        // }

        return ResponseEntity.ok(booking);
    }
}