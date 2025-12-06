package ma.fstt.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDTO {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Tenant wallet address is required")
    private String tenantWalletAddress;
}
