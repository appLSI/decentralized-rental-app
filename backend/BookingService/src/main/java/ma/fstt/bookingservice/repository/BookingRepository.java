package ma.fstt.bookingservice.repository;

import ma.fstt.bookingservice.model.Booking;
import ma.fstt.bookingservice.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Trouve les reservations dans un statut donne creees avant une certaine date.
     * Utilise par le scheduler pour trouver les reservations AWAITING_PAYMENT expirees.
     */
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime createdAt);

    /**
     * Check if there are any overlapping bookings for a property
     * Overlapping logic: New booking conflicts if:
     * - New start is before existing end AND new end is after existing start
     */
    @Query("SELECT b FROM Booking b WHERE b.propertyId = :propertyId " +
            "AND b.status IN :statuses " +
            "AND b.startDate < :endDate " +
            "AND b.endDate > :startDate")
    List<Booking> findOverlappingBookings(
            @Param("propertyId") String propertyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<BookingStatus> statuses
    );

    List<Booking> findByTenantId(String tenantId);

    // ✅ FIX: Changed from Long to String to match PropertyEntity.propertyId type
    List<Booking> findByPropertyId(String propertyId);

    /**
     * ✅ NEW: Find all bookings for multiple properties (for Host Dashboard)
     * Returns all bookings where propertyId is in the provided list
     */
    List<Booking> findByPropertyIdIn(List<String> propertyIds);

    /**
     * ✅ CRITICAL FIX: Changed @Param("propertyId") from Long to String
     * This matches the PropertyEntity.propertyId type in listing-service
     *
     * WORKAROUND: Compter les reservations futures par propertyId
     * Le service fera d'abord un appel a ListingService pour recuperer les propertyIds du host
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.propertyId = :propertyId AND b.startDate > :today")
    Long countFutureBookingsByPropertyId(@Param("propertyId") String propertyId, @Param("today") LocalDate today);

    /**
     * ✅ Compter les reservations actives d'un client
     * ATTENTION: Utilise seulement CONFIRMED (ONGOING n'existe pas dans BookingStatus!)
     */
    Long countByTenantIdAndStatusIn(String tenantId, List<BookingStatus> statuses);
}