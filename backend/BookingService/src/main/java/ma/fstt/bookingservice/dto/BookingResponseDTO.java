package ma.fstt.bookingservice.dto;


import ma.fstt.bookingservice.model.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {

    private Long id;
    private String propertyId;
    private String  tenantId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BookingStatus status;

    // Snapshot Fields
    private String tenantWalletAddress;
    private BigDecimal pricePerNight;
    private BigDecimal totalPrice;
    private String currency;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}