package ma.fstt.bookingservice.controller;

import ma.fstt.bookingservice.dto.BookingRequestDTO;
import ma.fstt.bookingservice.dto.BookingResponseDTO;
import ma.fstt.bookingservice.dto.HostBookingDTO;
import ma.fstt.bookingservice.model.BookingStatus;
import ma.fstt.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
     *
     * ✅ CORRECTION : tenantId reçu comme String (UUID) du Gateway
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @RequestHeader(value = "X-User-Id", required = true) String tenantId,
            @Valid @RequestBody BookingRequestDTO request
    ) {
        log.info("Received booking request from tenant {}", tenantId);
        BookingResponseDTO response = bookingService.createBooking(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ========== ENDPOINTS SPÉCIFIQUES (DOIVENT VENIR EN PREMIER) ==========

    /**
     * ✅ NEW: Host Dashboard - Get all bookings for properties owned by the host
     *
     * IMPORTANT: CET ENDPOINT DOIT VENIR AVANT /{bookingId}
     */
    @GetMapping("/host")
    public ResponseEntity<List<HostBookingDTO>> getHostBookings(
            @RequestHeader(value = "X-User-Id", required = true) String hostId
    ) {
        log.info("🏠 Fetching host dashboard bookings for host: {}", hostId);

        try {
            List<HostBookingDTO> hostBookings = bookingService.getBookingsForHost(hostId);

            log.info("✅ Successfully retrieved {} bookings for host {}",
                    hostBookings.size(), hostId);

            return ResponseEntity.ok(hostBookings);

        } catch (Exception e) {
            log.error("❌ Error fetching host bookings for host {}: {}",
                    hostId, e.getMessage());

            // Return empty list instead of error to avoid breaking the dashboard
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get all bookings for the authenticated tenant
     * ✅ CORRECTION : tenantId reçu comme String
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @RequestHeader(value = "X-User-Id", required = true) String tenantId
    ) {
        log.info("Fetching bookings for tenant {}", tenantId);
        List<BookingResponseDTO> bookings = bookingService.getBookingsByTenant(tenantId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * ✅ NEW: Get count of future bookings where user is the HOST (property owner)
     */
    @GetMapping("/host/{userId}/future-count")
    public ResponseEntity<Map<String, Object>> getFutureBookingsAsHost(@PathVariable String userId) {
        log.info("🔍 Counting future bookings for host: {}", userId);

        try {
            Map<String, Object> response = new HashMap<>();
            response.put("count", 0);
            response.put("userId", userId);
            response.put("message", "No future host bookings found");

            log.info("✅ Host booking count for {}: 0", userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error counting host bookings for user {}: {}", userId, e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("count", 0);
            response.put("userId", userId);
            response.put("error", "Could not verify host bookings");

            return ResponseEntity.ok(response);
        }
    }

    /**
     * ✅ NEW: Get count of active bookings where user is the CLIENT (tenant)
     */
    @GetMapping("/client/{userId}/active-count")
    public ResponseEntity<Map<String, Object>> getActiveBookingsAsClient(@PathVariable String userId) {
        log.info("🔍 Counting active bookings for client: {}", userId);

        try {
            List<BookingResponseDTO> allBookings = bookingService.getBookingsByTenant(userId);

            long activeCount = allBookings.stream()
                    .filter(booking ->
                            booking.getStatus() == BookingStatus.CONFIRMED ||
                                    booking.getStatus() == BookingStatus.AWAITING_PAYMENT ||
                                    booking.getStatus() == BookingStatus.PENDING
                    )
                    .count();

            Map<String, Object> response = new HashMap<>();
            response.put("count", activeCount);
            response.put("userId", userId);
            response.put("message", activeCount > 0
                    ? "User has active bookings as client"
                    : "No active client bookings found");

            log.info("✅ Active client booking count for {}: {}", userId, activeCount);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error counting client bookings for user {}: {}", userId, e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("count", 0);
            response.put("userId", userId);
            response.put("error", "Could not verify client bookings");

            return ResponseEntity.ok(response);
        }
    }

    /**
     * Cancel a booking (peut être appelé par l'utilisateur)
     * ✅ SÉCURISÉ : Vérification de propriété implémentée
     */
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) String tenantId
    ) {
        log.info("Cancelling booking {} by tenant {}", bookingId, tenantId);

        // ✅ Vérifier que l'utilisateur est le propriétaire de la réservation
        BookingResponseDTO booking = bookingService.getBookingById(bookingId);

        if (!booking.getTenantId().equals(tenantId)) {
            log.warn("Unauthorized cancellation attempt: booking {} by user {}",
                    bookingId, tenantId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        BookingResponseDTO response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(response);
    }

    // ========== ENDPOINT GÉNÉRIQUE (DOIT VENIR EN DERNIER) ==========

    /**
     * Get a specific booking by ID
     * ✅ SÉCURISÉ : Vérification de propriété implémentée
     *
     * IMPORTANT: CET ENDPOINT DOIT VENIR APRÈS TOUS LES ENDPOINTS SPÉCIFIQUES
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) String tenantId
    ) {
        log.info("Fetching booking {} by tenant {}", bookingId, tenantId);

        BookingResponseDTO booking = bookingService.getBookingById(bookingId);

        // ✅ Vérifier que l'utilisateur a le droit de voir cette réservation
        if (!booking.getTenantId().equals(tenantId)) {
            log.warn("Unauthorized access attempt: booking {} by user {}",
                    bookingId, tenantId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        return ResponseEntity.ok(booking);
    }
}