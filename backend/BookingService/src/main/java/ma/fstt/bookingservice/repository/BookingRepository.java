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
     * Trouve les réservations dans un statut donné créées avant une certaine date.
     * Utilisé par le scheduler pour trouver les réservations AWAITING_PAYMENT expirées.
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
            @Param("propertyId") Long propertyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<BookingStatus> statuses
    );

    List<Booking> findByTenantId(Long tenantId);

    List<Booking> findByPropertyId(Long propertyId);
}