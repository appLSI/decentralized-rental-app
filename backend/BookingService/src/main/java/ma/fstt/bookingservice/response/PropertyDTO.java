package ma.fstt.bookingservice.response;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class PropertyDTO {
    private Long id;
    private BigDecimal price;
    private String currency;
}