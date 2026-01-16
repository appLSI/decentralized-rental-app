package ma.fstt.bookingservice.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class PropertyDTO {

    // On change en String pour correspondre au propertyId du ListingService
    @JsonProperty("propertyId")
    private String id;

    // On mappe le champ "pricePerNight" du JSON sur notre variable "price"
    @JsonProperty("pricePerNight")
    private BigDecimal price;

    private String currency; // Restera null si non envoyé, mais ne fera pas planter le calcul
}