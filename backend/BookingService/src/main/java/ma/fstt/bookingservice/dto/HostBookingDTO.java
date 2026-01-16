package ma.fstt.bookingservice.dto;

import lombok.*;
import ma.fstt.bookingservice.model.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Host Dashboard - Shows bookings on host's properties with tenant details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostBookingDTO {

    private Long bookingId;

    private String propertyId;

    // Tenant Information (from Tenant entity in BookingService)
    private String tenantId;
    private String tenantName;
    private String tenantEmail;

    // Booking Details
    private LocalDate startDate;
    private LocalDate endDate;
    private BookingStatus status;

    // Pricing
    private BigDecimal pricePerNight;
    private BigDecimal totalPrice;
    private String currency;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}