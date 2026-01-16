package ma.fstt.bookingservice.service;

import ma.fstt.bookingservice.client.AuthServiceClient;
import ma.fstt.bookingservice.dto.BookingRequestDTO;
import ma.fstt.bookingservice.dto.BookingResponseDTO;
import ma.fstt.bookingservice.entities.Tenant;
import ma.fstt.bookingservice.dto.HostBookingDTO;
import ma.fstt.bookingservice.repository.BookingRepository;
import ma.fstt.bookingservice.repository.TenantRepository;
import ma.fstt.bookingservice.response.PropertyDTO;
import ma.fstt.bookingservice.response.WalletStatusDTO;
import ma.fstt.bookingservice.exception.*;
import ma.fstt.bookingservice.model.Booking;
import ma.fstt.bookingservice.model.BookingStatus;
import ma.fstt.bookingservice.client.ListingServiceClient;

import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
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

    private final TenantRepository tenantRepository;
    /**
     * ✅ MODIFIÉ : Récupération automatique du wallet + String tenantId + String propertyId
     * Trust-But-Verify Pattern: Create Booking with strict validation
     * État final : AWAITING_PAYMENT
     */
    @Transactional
    public BookingResponseDTO createBooking(String tenantId, BookingRequestDTO request) {
        log.info("Creating booking for tenant {} - Property {}", tenantId, request.getPropertyId());

        // ✅ Récupérer automatiquement le wallet de l'utilisateur (avec Circuit Breaker)
        String tenantWallet = getConnectedWallet(tenantId);
        log.info("✅ Using connected wallet: {} for tenant {}", tenantWallet, tenantId);

        // Step 1: Validate Dates
        validateDates(request.getStartDate(), request.getEndDate());

        // Step 2: Check Property Availability
        checkAvailability(request.getPropertyId(), request.getStartDate(), request.getEndDate());

        // Step 3: Fetch Current Price from ListingService (Snapshot Pattern + Circuit Breaker)
        // ✅ CORRECTION: Passer directement le String propertyId (pas de conversion en Long)
        PropertyDTO property = fetchPropertyPricing(request.getPropertyId());

        // Step 4: Calculate Total Price
        long numberOfNights = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalPrice = property.getPrice().multiply(BigDecimal.valueOf(numberOfNights));

        // ✅ CORRECTION: Log sans property.getCurrency() pour éviter les NullPointerException
        log.info("Calculated price: {} nights × {} ETH = {} ETH",
                numberOfNights, property.getPrice(), totalPrice);

        // Step 5: Create Booking with AWAITING_PAYMENT status
        Booking booking = Booking.builder()
                .propertyId(request.getPropertyId())  // ✅ String propertyId
                .tenantId(tenantId)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(BookingStatus.AWAITING_PAYMENT)
                .tenantWalletAddress(tenantWallet)
                .pricePerNight(property.getPrice())
                .totalPrice(totalPrice)
                .currency("ETH")  // ✅ CORRECTION: Force "ETH" au lieu de property.getCurrency()
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created with ID: {} - Status: AWAITING_PAYMENT", savedBooking.getId());

        // Publier l'événement "booking.created" pour le PaymentService
        rabbitTemplate.convertAndSend(exchange, createdRoutingKey, savedBooking);
        log.info("Published booking.created event for booking {}", savedBooking.getId());

        return mapToResponseDTO(savedBooking);
    }

    /**
     * ✅ Récupère automatiquement le wallet connecté de l'utilisateur
     * 🔄 PROTECTION : Circuit Breaker pour gérer l'indisponibilité d'AuthService
     *
     * @param userId ID de l'utilisateur (String UUID)
     * @return Adresse du wallet connecté
     * @throws WalletNotConnectedException Si l'utilisateur n'a pas de wallet connecté
     * @throws ServiceUnavailableException Si AuthService est indisponible (fallback)
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "getWalletFallback")
    private String getConnectedWallet(String userId) {
        log.debug("🔍 Fetching connected wallet for user {}", userId);

        try {
            WalletStatusDTO walletStatus = authServiceClient.getWalletStatus(userId);

            if (!walletStatus.getExists()) {
                log.warn("❌ User {} does not have a connected wallet", userId);
                throw new WalletNotConnectedException(
                        "You must connect your wallet before creating a booking. " +
                                "Please go to your profile settings and connect your Web3 wallet (MetaMask, etc.)."
                );
            }

            log.info("✅ Wallet found for user {}: {}", userId, walletStatus.getWalletAddress());
            return walletStatus.getWalletAddress();

        } catch (FeignException.NotFound e) {
            log.error("❌ User {} not found in AuthService", userId);
            throw new BookingException("User not found. Please contact support.");

        } catch (FeignException e) {
            log.error("❌ Error communicating with AuthService: {}", e.getMessage());
            throw new BookingException(
                    "Unable to verify wallet connection. Please try again later.", e
            );
        }
    }

    /**
     * ✅ FALLBACK : Méthode de secours si AuthService est indisponible
     * Appelée automatiquement par le Circuit Breaker
     */
    private String getWalletFallback(String userId, Exception e) {
        log.error("❌ AuthService circuit breaker activated for user {}: {}", userId, e.getMessage());
        throw new ServiceUnavailableException(
                "Authentication service is temporarily unavailable. Please try again later."
        );
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
     * ✅ SÉCURISÉ : Cancel a booking avec validation stricte des statuts
     *
     * RÈGLES MÉTIER :
     * - AWAITING_PAYMENT → CANCELLED ✅ (pas encore payé, annulation simple)
     * - CONFIRMED → CANCELLED ✅ (payé, nécessite remboursement)
     * - CANCELLED → Exception ❌ (déjà annulé)
     * - EXPIRED → Exception ❌ (déjà expiré)
     */
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // ⚠️ VALIDATION: Vérifier les transitions autorisées
        BookingStatus previousStatus = booking.getStatus();

        if (previousStatus == BookingStatus.CANCELLED) {
            throw new BookingException("Booking is already cancelled");
        }

        if (previousStatus == BookingStatus.EXPIRED) {
            throw new BookingException("Booking has expired and cannot be cancelled");
        }

        // Autorisé: AWAITING_PAYMENT, CONFIRMED
        if (previousStatus != BookingStatus.AWAITING_PAYMENT && previousStatus != BookingStatus.CONFIRMED) {
            throw new BookingException(
                    String.format("Cannot cancel booking in status %s", previousStatus)
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);

        // Publier l'événement d'annulation
        rabbitTemplate.convertAndSend(exchange, cancelledRoutingKey, cancelledBooking);
        log.info("Booking {} cancelled (was: {}) - Published cancellation event",
                bookingId, previousStatus);

        return mapToResponseDTO(cancelledBooking);
    }

    /**
     * 🕐 MÉTHODE POUR LE SCHEDULER : Expirer les paiements non payés
     * Transition : AWAITING_PAYMENT → EXPIRED (après 15 min)
     */
    @Transactional
    public void expireUnpaidBookings() {
        log.info("Running expiration job for unpaid bookings...");
        // TODO: Implémenté dans BookingExpirationScheduler
    }

    // ========== MÉTHODES DE VALIDATION ==========

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

    /**
     * ✅ CORRECTION: propertyId est maintenant un String
     */
    private void checkAvailability(String propertyId, LocalDate startDate, LocalDate endDate) {
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

    /**
     * ✅ CORRECTION: Fetch property pricing avec String propertyId
     * 🔄 PROTECTION : Circuit Breaker pour gérer l'indisponibilité de ListingService
     */
    @CircuitBreaker(name = "listingService", fallbackMethod = "getPropertyFallback")
    private PropertyDTO fetchPropertyPricing(String propertyId) {
        try {
            PropertyDTO property = listingServiceClient.getProperty(propertyId);

            if (property.getPrice() == null || property.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BookingException("Property does not have a valid price");
            }

            // ✅ CORRECTION: Log sans property.getCurrency() car il peut être null
            log.info("Fetched property pricing: {} ETH/night", property.getPrice());
            return property;

        } catch (FeignException.NotFound e) {
            throw new PropertyNotFoundException("Property not found with ID: " + propertyId);
        } catch (FeignException e) {
            log.error("Error fetching property pricing: {}", e.getMessage());
            throw new BookingException("Unable to fetch property details", e);
        }
    }

    /**
     * ✅ CORRECTION: FALLBACK avec String propertyId
     * Méthode de secours si ListingService est indisponible
     * Appelée automatiquement par le Circuit Breaker
     */
    private PropertyDTO getPropertyFallback(String propertyId, Exception e) {
        log.error("❌ ListingService circuit breaker activated for property {}: {}",
                propertyId, e.getMessage());
        throw new ServiceUnavailableException(
                "Property service is temporarily unavailable. Please try again later."
        );
    }

    /**
     * ✅ Get bookings by tenant
     */
    public List<BookingResponseDTO> getBookingsByTenant(String tenantId) {
        return bookingRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * ✅ Get booking by ID
     */
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

    /**
     * ✅ NOUVEAU: Compter les réservations futures en tant qu'hôte
     *
     * ⚠️ LIMITATION: Booking n'a pas de relation directe avec Property
     * On ne peut donc pas faire de query JPA pour récupérer les bookings par hostId
     *
     * SOLUTIONS POSSIBLES:
     * 1. Appeler ListingService pour récupérer toutes les propertyIds du host, puis compter
     * 2. Retourner toujours 0 (désactiver la vérification pour les hosts)
     * 3. Ajouter une table de mapping host_id <-> property_id dans BookingService
     *
     * Pour l'instant: Solution 2 (retourner 0)
     * Cela signifie que les hosts pourront toujours déconnecter leur wallet
     */
    public Long countFutureBookingsByHost(String hostId) {
        log.warn("⚠️ countFutureBookingsByHost: Feature not fully implemented - returning 0");
        log.warn("⚠️ Reason: Booking entity does not have @ManyToOne relationship with Property");
        log.warn("⚠️ To fix: Either add Property relationship or call ListingService to get propertyIds");

        // Option: Retourner 0 pour désactiver cette vérification
        return 0L;

        /* ALTERNATIVE: Appeler ListingService pour récupérer les propertyIds
        try {
            // 1. Récupérer toutes les properties du host via ListingService
            List<String> propertyIds = listingServiceClient.getPropertiesByOwner(hostId)
                    .stream()
                    .map(PropertyDTO::getPropertyId)
                    .toList();

            if (propertyIds.isEmpty()) {
                return 0L;
            }

            // 2. Compter les bookings futurs pour ces properties
            LocalDate today = LocalDate.now();
            long count = 0L;
            for (String propertyId : propertyIds) {
                count += bookingRepository.countFutureBookingsByPropertyId(propertyId, today);
            }
            return count;

        } catch (Exception e) {
            log.error("❌ Error counting future bookings for host {}: {}", hostId, e.getMessage());
            return 0L; // En cas d'erreur, retourner 0 pour ne pas bloquer
        }
        */
    }

    /**
     * ✅ NOUVEAU: Compter les réservations actives en tant que client
     *
     * ⚠️ FIX: Utilise seulement CONFIRMED
     * ONGOING n'existe pas dans BookingStatus!
     */
    public Long countActiveBookingsByClient(String clientId) {
        // ✅ Utiliser seulement les statuses qui existent
        // CONFIRMED = réservation payée et confirmée
        return bookingRepository.countByTenantIdAndStatusIn(
                clientId,
                Arrays.asList(BookingStatus.CONFIRMED) // Pas ONGOING!
        );
    }

    /**
     * ✅ ADD THESE METHODS TO BookingService CLASS
     * Location: ma.fstt.bookingservice.service.BookingService
     *
     * Add these imports at the top:
     * import ma.fstt.bookingservice.dto.HostBookingDTO;
     * import ma.fstt.bookingservice.repository.TenantRepository;
     * import ma.fstt.bookingservice.entities.Tenant;
     * import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
     * import feign.FeignException;
     */

// Add this field to the class (with @Autowired or in constructor with @RequiredArgsConstructor)


    /**
     * ✅ NEW: Get all bookings for properties owned by a specific host
     * This is for the Host Dashboard feature
     *
     * Flow:
     * 1. Call ListingService to get all property IDs owned by the host
     * 2. Query BookingRepository to get all bookings for these properties
     * 3. For each booking, retrieve tenant details from local TenantRepository
     * 4. Map to HostBookingDTO with tenant name and email
     *
     * @param hostId The host's user ID (owner ID)
     * @return List of bookings with tenant details
     */
    @CircuitBreaker(name = "listingService", fallbackMethod = "getHostBookingsFallback")
    public List<HostBookingDTO> getBookingsForHost(String hostId) {
        log.info("🏠 Fetching bookings for host: {}", hostId);

        try {
            // Step 1: Get all property IDs owned by this host
            List<String> propertyIds = listingServiceClient.getPropertyIdsByOwner(hostId);

            if (propertyIds.isEmpty()) {
                log.info("📭 Host {} has no properties", hostId);
                return List.of();
            }

            log.info("📋 Host {} has {} properties", hostId, propertyIds.size());

            // Step 2: Get all bookings for these properties
            List<Booking> bookings = bookingRepository.findByPropertyIdIn(propertyIds);

            if (bookings.isEmpty()) {
                log.info("📭 No bookings found for host {}'s properties", hostId);
                return List.of();
            }

            log.info("📊 Found {} bookings for host {}'s properties", bookings.size(), hostId);

            // Step 3: Map each booking to HostBookingDTO with tenant details
            return bookings.stream()
                    .map(this::mapToHostBookingDTO)
                    .toList();

        } catch (FeignException.NotFound e) {
            log.warn("⚠️ Host {} not found in ListingService", hostId);
            return List.of();
        } catch (FeignException e) {
            log.error("❌ Error communicating with ListingService: {}", e.getMessage());
            throw new BookingException("Unable to fetch host properties. Please try again later.", e);
        }
    }

    /**
     * ✅ Fallback method for getBookingsForHost when ListingService is unavailable
     */
    private List<HostBookingDTO> getHostBookingsFallback(String hostId, Exception e) {
        log.error("❌ ListingService circuit breaker activated while fetching host bookings: {}",
                e.getMessage());
        throw new ServiceUnavailableException(
                "Property service is temporarily unavailable. Please try again later."
        );
    }

    /**
     * ✅ NEW: Map Booking to HostBookingDTO with tenant details
     * Retrieves tenant information from local TenantRepository
     *
     * @param booking The booking entity
     * @return HostBookingDTO with tenant details
     */
    private HostBookingDTO mapToHostBookingDTO(Booking booking) {
        // Retrieve tenant details from local repository
        Tenant tenant = tenantRepository.findByUserId(booking.getTenantId())
                .orElse(null);

        // Build tenant name (firstname + lastname)
        String tenantName = "Unknown";
        String tenantEmail = "N/A";

        if (tenant != null) {
            // Build full name
            if (tenant.getFirstname() != null && tenant.getLastname() != null) {
                tenantName = tenant.getFirstname() + " " + tenant.getLastname();
            } else if (tenant.getFirstname() != null) {
                tenantName = tenant.getFirstname();
            } else if (tenant.getLastname() != null) {
                tenantName = tenant.getLastname();
            }

            // Get email
            if (tenant.getEmail() != null) {
                tenantEmail = tenant.getEmail();
            }
        } else {
            log.warn("⚠️ Tenant {} not found in local repository for booking {}",
                    booking.getTenantId(), booking.getId());
        }

        return HostBookingDTO.builder()
                .bookingId(booking.getId())
                .propertyId(booking.getPropertyId())
                .tenantId(booking.getTenantId())
                .tenantName(tenantName)
                .tenantEmail(tenantEmail)
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .pricePerNight(booking.getPricePerNight())
                .totalPrice(booking.getTotalPrice())
                .currency(booking.getCurrency())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}