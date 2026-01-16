package ma.fstt.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private Long propertyId;
    private String tenantId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String tenantWalletAddress;
    private BigDecimal pricePerNight;
    private BigDecimal totalPrice;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}