package ma.fstt.paymentservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.paymentservice.dto.PaymentResponseDTO;
import ma.fstt.paymentservice.dto.PaymentValidationRequestDTO;
import ma.fstt.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * REST Controller pour la gestion des paiements blockchain
 *
 * ✅ CORRECTIONS APPLIQUÉES:
 * - Ligne 31: RestTemplate injecté
 * - Ligne 52: userId String au lieu de Long
 * - Ligne 118: userId String au lieu de Long
 * - Lignes 61-91: Validation sécurité
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final RestTemplate restTemplate;  // ✅ CRITIQUE

    @Value("${booking.service.url:http://localhost:8083}")
    private String bookingServiceUrl;

    /**
     * Valider un paiement blockchain
     */
    @PostMapping("/validate")
    public ResponseEntity<PaymentResponseDTO> validatePayment(
            @Valid @RequestBody PaymentValidationRequestDTO request,
            @RequestHeader(value = "X-User-Id", required = true) String userId  // ✅ String
    ) {
        log.info("🔥 Received payment validation request:");
        log.info("   User ID: {}", userId);
        log.info("   Booking ID: {}", request.getBookingId());
        log.info("   Transaction: {}", request.getTransactionHash());
        log.info("   Contract: {}", request.getContractAddress());

        // ✅ VALIDATION SÉCURITÉ
        try {
            String url = bookingServiceUrl + "/bookings/" + request.getBookingId();

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> bookingResponse = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> booking = bookingResponse.getBody();

            if (booking == null || !userId.equals(booking.get("tenantId"))) {
                log.error("❌ User {} is not the tenant of booking {}", userId, request.getBookingId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            if (!"AWAITING_PAYMENT".equals(booking.get("status"))) {
                log.error("❌ Booking {} status is {}", request.getBookingId(), booking.get("status"));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            log.info("✅ User authorization verified");

        } catch (RestClientException e) {
            log.error("❌ Failed to verify booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        // ✅ VALIDATION BLOCKCHAIN
        PaymentResponseDTO response = paymentService.validatePayment(request);

        log.info("✅ Payment validation completed with status: {}", response.getStatus());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    /**
     * Récupérer l'historique des paiements pour un booking
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) String userId  // ✅ String
    ) {
        log.info("📥 Fetching payments for booking {} (user: {})", bookingId, userId);

        List<PaymentResponseDTO> payments = paymentService.getAllPaymentsByBookingId(bookingId);

        log.info("✅ Found {} payment(s) for booking {}", payments.size(), bookingId);

        return ResponseEntity.ok(payments);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("PaymentService is running");
    }
}