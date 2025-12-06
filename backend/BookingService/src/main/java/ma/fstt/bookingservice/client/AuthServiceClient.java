package ma.fstt.bookingservice.client;



import ma.fstt.bookingservice.response.WalletStatusDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "auth-service",
        url = "${external.services.auth.url}"
)
public interface AuthServiceClient {

    @GetMapping("/users/{userId}/wallet/status")
    WalletStatusDTO getWalletStatus(@PathVariable("userId") Long userId);
}