package ma.fstt.bookingservice.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class WalletStatusDTO {
    private Long userId;
    private String walletAddress;
    private Boolean exists;
}