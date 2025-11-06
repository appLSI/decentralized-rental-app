package ma.fstt.listingservice.controller;

import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.TypeCharacteristique;
import ma.fstt.listingservice.repositories.CharacteristicRepository;
import ma.fstt.listingservice.repositories.TypeCaracteristiqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/characteristics")
public class CharacteristicController {

    @Autowired
    private CharacteristicRepository characteristicRepository;

    @Autowired
    private TypeCaracteristiqueRepository typeCaracteristiqueRepository;

    /**
     * Récupérer toutes les caractéristiques (pour que l'utilisateur puisse choisir)
     */
    @GetMapping
    public ResponseEntity<List<Characteristic>> getAllCharacteristics() {
        List<Characteristic> characteristics = characteristicRepository.findAll();
        return ResponseEntity.ok(characteristics);
    }

    /**
     * Récupérer une caractéristique par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Characteristic> getCharacteristicById(@PathVariable Long id) {
        return characteristicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Créer une nouvelle caractéristique (ADMIN UNIQUEMENT)
     */
    @PostMapping
    public ResponseEntity<?> createCharacteristic(@RequestBody CharacteristicRequest request) {
        try {
            // Vérifier que le type existe
            TypeCharacteristique type = typeCaracteristiqueRepository.findById(request.getTypeCaracteristiqueId())
                    .orElseThrow(() -> new RuntimeException("Type de caractéristique non trouvé"));

            Characteristic characteristic = new Characteristic();
            characteristic.setName(request.getName());
            characteristic.setIconPath(request.getIconPath());
            characteristic.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            characteristic.setTypeCaracteristique(type);

            Characteristic saved = characteristicRepository.save(characteristic);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Caractéristique créée avec succès");
            response.put("characteristic", saved);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Mettre à jour une caractéristique (ADMIN UNIQUEMENT)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCharacteristic(@PathVariable Long id, @RequestBody CharacteristicRequest request) {
        try {
            Characteristic characteristic = characteristicRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Caractéristique non trouvée"));

            if (request.getName() != null) {
                characteristic.setName(request.getName());
            }
            if (request.getIconPath() != null) {
                characteristic.setIconPath(request.getIconPath());
            }
            if (request.getIsActive() != null) {
                characteristic.setIsActive(request.getIsActive());
            }
            if (request.getTypeCaracteristiqueId() != null) {
                TypeCharacteristique type = typeCaracteristiqueRepository.findById(request.getTypeCaracteristiqueId())
                        .orElseThrow(() -> new RuntimeException("Type de caractéristique non trouvé"));
                characteristic.setTypeCaracteristique(type);
            }

            Characteristic updated = characteristicRepository.save(characteristic);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Supprimer une caractéristique (ADMIN UNIQUEMENT)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCharacteristic(@PathVariable Long id) {
        try {
            if (!characteristicRepository.existsById(id)) {
                throw new RuntimeException("Caractéristique non trouvée");
            }
            characteristicRepository.deleteById(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Caractéristique supprimée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Request DTO
     */
    public static class CharacteristicRequest {
        private String name;
        private String iconPath;
        private Boolean isActive;
        private Long typeCaracteristiqueId;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getIconPath() {
            return iconPath;
        }

        public void setIconPath(String iconPath) {
            this.iconPath = iconPath;
        }

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }

        public Long getTypeCaracteristiqueId() {
            return typeCaracteristiqueId;
        }

        public void setTypeCaracteristiqueId(Long typeCaracteristiqueId) {
            this.typeCaracteristiqueId = typeCaracteristiqueId;
        }
    }
}