package ma.fstt.bookingservice.client;

import ma.fstt.bookingservice.response.WalletStatusDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * ✅ CORRECTION : userId doit être String (UUID) pas Long
 * Car AuthService utilise String UUID pour identifier les users
 */
@FeignClient(
        name = "auth-service",
        url = "${external.services.auth.url}"
)
public interface AuthServiceClient {

    /**
     * Récupérer le statut du wallet d'un utilisateur
     *
     * @param userId String UUID de l'utilisateur (pas Long!)
     * @return Status du wallet avec adresse et existence
     */
    @GetMapping("/users/{userId}/wallet/status")
    WalletStatusDTO getWalletStatus(@PathVariable("userId") String userId);
}