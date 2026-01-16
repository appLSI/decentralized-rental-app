package ma.fstt.bookingservice.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class WalletStatusDTO {
    private String userId;    // ✅ FIX: String UUID
    private String walletAddress;
    private Boolean exists;
}