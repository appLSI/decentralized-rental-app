package ma.fstt.listingservice.controller;

import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.repositories.OwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/owners")
public class OwnerController {

    @Autowired
    private OwnerRepository ownerRepository;

    /**
     * Vérifier si l'owner existe et a une wallet address
     * GET /owners/check/{userId}
     */
    @GetMapping("/check/{userId}")
    public ResponseEntity<Map<String, Object>> checkOwnerStatus(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();

        Owner owner = ownerRepository.findByUserId(userId).orElse(null);

        if (owner == null) {
            response.put("exists", false);
            response.put("hasWalletAddress", false);
            response.put("message", "Owner not found. Please ensure user is synchronized from Auth Service.");
            return ResponseEntity.ok(response);
        }

        boolean hasWallet = owner.getWalletAddress() != null && !owner.getWalletAddress().trim().isEmpty();

        response.put("exists", true);
        response.put("hasWalletAddress", hasWallet);
        response.put("userId", owner.getUserId());
        response.put("walletAddress", owner.getWalletAddress());
        response.put("canCreateProperty", hasWallet);

        if (!hasWallet) {
            response.put("message", "Owner exists but does not have a wallet address. Cannot create properties.");
        } else {
            response.put("message", "Owner is ready to create properties.");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer les informations de l'owner
     * GET /owners/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getOwner(@PathVariable String userId) {
        Owner owner = ownerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with userId: " + userId));

        Map<String, Object> response = new HashMap<>();
        response.put("userId", owner.getUserId());
        response.put("walletAddress", owner.getWalletAddress());

        return ResponseEntity.ok(response);
    }

    /**
     * Lister tous les owners (pour admin/debug)
     * GET /owners
     */
    @GetMapping
    public ResponseEntity<?> getAllOwners() {
        return ResponseEntity.ok(ownerRepository.findAll());
    }
}