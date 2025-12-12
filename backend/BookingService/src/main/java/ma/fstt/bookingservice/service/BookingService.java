package ma.fstt.bookingservice.service;

import ma.fstt.bookingservice.client.AuthServiceClient;
import ma.fstt.bookingservice.repository.BookingRepository;
import ma.fstt.bookingservice.dto.BookingRequestDTO;
import ma.fstt.bookingservice.dto.BookingResponseDTO;
import ma.fstt.bookingservice.response.PropertyDTO;
import ma.fstt.bookingservice.response.WalletStatusDTO;
import ma.fstt.bookingservice.exception.*;
import ma.fstt.bookingservice.model.Booking;
import ma.fstt.bookingservice.model.BookingStatus;
import ma.fstt.bookingservice.client.ListingServiceClient;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AuthServiceClient authServiceClient;
    private final ListingServiceClient listingServiceClient;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.confirmed}")
    private String confirmedRoutingKey;

    @Value("${rabbitmq.routing-key.cancelled}")
    private String cancelledRoutingKey;

    @Value("${rabbitmq.routing-key.created}")
    private String createdRoutingKey;

    /**
     * Trust-But-Verify Pattern: Create Booking with strict validation
     * État final : AWAITING_PAYMENT (pas PENDING)
     */
    @Transactional
    public BookingResponseDTO createBooking(Long tenantId, BookingRequestDTO request) {
        log.info("Creating booking for tenant {} - Property {}", tenantId, request.getPropertyId());

        // Step 1: Validate Dates
        validateDates(request.getStartDate(), request.getEndDate());

        // Step 2: Verify Wallet Ownership (Security Layer)
        verifyWalletOwnership(tenantId, request.getTenantWalletAddress());

        // Step 3: Check Property Availability
        checkAvailability(request.getPropertyId(), request.getStartDate(), request.getEndDate());

        // Step 4: Fetch Current Price from ListingService (Snapshot Pattern)
        PropertyDTO property = fetchPropertyPricing(request.getPropertyId());

        // Step 5: Calculate Total Price
        long numberOfNights = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalPrice = property.getPrice().multiply(BigDecimal.valueOf(numberOfNights));

        log.info("Calculated price: {} nights × {} {} = {} {}",
                numberOfNights, property.getPrice(), property.getCurrency(), totalPrice, property.getCurrency());

        // Step 6: Create Booking with AWAITING_PAYMENT status
        // ⚠️ CHANGEMENT CRITIQUE : On passe directement à AWAITING_PAYMENT
        Booking booking = Booking.builder()
                .propertyId(request.getPropertyId())
                .tenantId(tenantId)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(BookingStatus.AWAITING_PAYMENT) // ← Statut sécurisé
                .tenantWalletAddress(request.getTenantWalletAddress())
                .pricePerNight(property.getPrice())
                .totalPrice(totalPrice)
                .currency(property.getCurrency())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created with ID: {} - Status: AWAITING_PAYMENT", savedBooking.getId());

        // Publier l'événement "booking.created" pour le PaymentService
        rabbitTemplate.convertAndSend(exchange, createdRoutingKey, savedBooking);
        log.info("Published booking.created event for booking {}", savedBooking.getId());

        return mapToResponseDTO(savedBooking);
    }

    /**
     * 🔒 MÉTHODE SÉCURISÉE : Confirmation après validation du paiement
     * Cette méthode NE DOIT JAMAIS être appelée directement par le Frontend
     * Elle est destinée au PaymentService via RabbitMQ ou appel interne
     */
    @Transactional
    public BookingResponseDTO confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // ⚠️ VALIDATION STRICTE DES ÉTATS
        if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT) {
            log.error("Illegal state transition attempted: {} -> CONFIRMED for booking {}",
                    booking.getStatus(), bookingId);
            throw new BookingException(
                    String.format("Cannot confirm booking in status %s. Only AWAITING_PAYMENT bookings can be confirmed.",
                            booking.getStatus())
            );
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking confirmedBooking = bookingRepository.save(booking);

        // Publier l'événement de confirmation
        rabbitTemplate.convertAndSend(exchange, confirmedRoutingKey, confirmedBooking);
        log.info("Booking {} confirmed - Published confirmation event", bookingId);

        return mapToResponseDTO(confirmedBooking);
    }

    /**
     * Cancel a booking (peut être appelé par l'utilisateur)
     */
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // On peut annuler si AWAITING_PAYMENT ou CONFIRMED
        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.EXPIRED) {
            throw new BookingException("Booking is already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);

        rabbitTemplate.convertAndSend(exchange, cancelledRoutingKey, cancelledBooking);
        log.info("Booking {} cancelled - Published cancellation event", bookingId);

        return mapToResponseDTO(cancelledBooking);
    }

    /**
     * 🕐 MÉTHODE POUR LE SCHEDULER : Expirer les paiements non payés
     * À appeler toutes les minutes via @Scheduled
     */
    @Transactional
    public void expireUnpaidBookings() {
        // Trouver toutes les réservations AWAITING_PAYMENT de plus de 15 min
        // (Tu devras ajouter cette requête dans BookingRepository)
        log.info("Running expiration job for unpaid bookings...");
        // TODO: Implémenter la logique d'expiration
    }

    // ========== MÉTHODES DE VALIDATION (INCHANGÉES) ==========

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (startDate.isBefore(today)) {
            throw new BookingException("Start date cannot be in the past");
        }

        if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
            throw new BookingException("End date must be after start date");
        }

        long nights = ChronoUnit.DAYS.between(startDate, endDate);
        if (nights < 1) {
            throw new BookingException("Booking must be at least 1 night");
        }
    }

    private void verifyWalletOwnership(Long tenantId, String providedWalletAddress) {
        log.debug("Verifying wallet ownership for user {} and address {}", tenantId, providedWalletAddress);

        try {
            WalletStatusDTO walletStatus = authServiceClient.getWalletStatus(tenantId);

            if (!walletStatus.getExists()) {
                throw new WalletMismatchException(
                        "User does not have a registered wallet address"
                );
            }

            if (!walletStatus.getWalletAddress().equalsIgnoreCase(providedWalletAddress)) {
                log.warn("Wallet mismatch detected! Expected: {}, Provided: {}",
                        walletStatus.getWalletAddress(), providedWalletAddress);
                throw new WalletMismatchException(
                        "Provided wallet address does not match user's registered wallet"
                );
            }

            log.info("Wallet ownership verified successfully for user {}", tenantId);

        } catch (FeignException.NotFound e) {
            throw new WalletMismatchException("User not found or wallet not registered");
        } catch (FeignException e) {
            log.error("Error communicating with AuthService: {}", e.getMessage());
            throw new BookingException("Unable to verify wallet ownership", e);
        }
    }

    private void checkAvailability(Long propertyId, LocalDate startDate, LocalDate endDate) {
        // On considère aussi AWAITING_PAYMENT comme "bloquant"
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.AWAITING_PAYMENT,
                BookingStatus.CONFIRMED
        );

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                propertyId, startDate, endDate, activeStatuses
        );

        if (!overlappingBookings.isEmpty()) {
            log.warn("Property {} is not available for dates {} to {}", propertyId, startDate, endDate);
            throw new PropertyNotAvailableException(
                    "Property is already booked for the selected dates"
            );
        }
    }

    private PropertyDTO fetchPropertyPricing(Long propertyId) {
        try {
            PropertyDTO property = listingServiceClient.getProperty(propertyId);

            if (property.getPrice() == null || property.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BookingException("Property does not have a valid price");
            }

            log.info("Fetched property pricing: {} {}/night", property.getPrice(), property.getCurrency());
            return property;

        } catch (FeignException.NotFound e) {
            throw new PropertyNotFoundException("Property not found with ID: " + propertyId);
        } catch (FeignException e) {
            log.error("Error fetching property pricing: {}", e.getMessage());
            throw new BookingException("Unable to fetch property details", e);
        }
    }

    public List<BookingResponseDTO> getBookingsByTenant(Long tenantId) {
        return bookingRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));
        return mapToResponseDTO(booking);
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .propertyId(booking.getPropertyId())
                .tenantId(booking.getTenantId())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .tenantWalletAddress(booking.getTenantWalletAddress())
                .pricePerNight(booking.getPricePerNight())
                .totalPrice(booking.getTotalPrice())
                .currency(booking.getCurrency())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}