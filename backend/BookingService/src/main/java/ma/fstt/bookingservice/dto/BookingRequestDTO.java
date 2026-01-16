package ma.fstt.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequestDTO {
    @NotNull(message = "Property ID is required")
    private String propertyId; // CHANGÉ : Long -> String

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;
}