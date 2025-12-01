package ma.fstt.listingservice.controller;

import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.enums.PropertyStatus;
import ma.fstt.listingservice.responses.PropertyResponse;
import ma.fstt.listingservice.services.PropertyService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur pour les opérations ADMIN sur les propriétés
 * Endpoints protégés par rôle ADMIN uniquement
 */
@RestController
@RequestMapping("/admin/properties")
public class AdminPropertyController {

    @Autowired
    private PropertyService propertyService;

    // ========== VALIDATION & MODÉRATION ==========

    /**
     * GET /admin/properties/pending
     * Liste toutes les propriétés en attente de validation
     */
    @GetMapping("/pending")
    public ResponseEntity<Page<PropertyResponse>> getPendingProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("X-User-Id") String adminId,
            @RequestHeader("X-User-Role") String role) {

        try {
            // Vérifier que c'est un ADMIN
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<PropertyDto> properties = propertyService.getPropertiesByStatus(
                    PropertyStatus.PENDING_VALIDATION, pageable);

            Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * POST /admin/properties/{propertyId}/validate
     * Valider une propriété (PENDING → ACTIVE)
     */
    @PostMapping("/{propertyId}/validate")
    public ResponseEntity<?> validateProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String adminId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody(required = false) Map<String, String> body) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            String comment = body != null ? body.get("comment") : null;

            PropertyDto updatedProperty = propertyService.adminValidateProperty(
                    propertyId, adminId, comment);

            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété validée et publiée avec succès");
            result.put("property", response);
            result.put("validatedBy", adminId);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * POST /admin/properties/{propertyId}/reject
     * Rejeter une propriété avec raison
     */
    @PostMapping("/{propertyId}/reject")
    public ResponseEntity<?> rejectProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String adminId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody Map<String, String> body) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            String reason = body.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                throw new RuntimeException("Rejection reason is required");
            }

            PropertyDto updatedProperty = propertyService.adminRejectProperty(
                    propertyId, adminId, reason);

            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété rejetée");
            result.put("property", response);
            result.put("rejectedBy", adminId);
            result.put("reason", reason);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * POST /admin/properties/{propertyId}/suspend
     * Suspendre une propriété (violation des règles)
     */
    @PostMapping("/{propertyId}/suspend")
    public ResponseEntity<?> suspendProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String adminId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody Map<String, String> body) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            String reason = body.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                throw new RuntimeException("Suspension reason is required");
            }

            PropertyDto updatedProperty = propertyService.adminSuspendProperty(
                    propertyId, adminId, reason);

            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété suspendue");
            result.put("property", response);
            result.put("suspendedBy", adminId);
            result.put("reason", reason);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * POST /admin/properties/{propertyId}/reactivate
     * Réactiver une propriété suspendue
     */
    @PostMapping("/{propertyId}/reactivate")
    public ResponseEntity<?> reactivateProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String adminId,
            @RequestHeader("X-User-Role") String role) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            PropertyDto updatedProperty = propertyService.adminReactivateProperty(
                    propertyId, adminId);

            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété réactivée");
            result.put("property", response);
            result.put("reactivatedBy", adminId);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ========== STATISTIQUES & MONITORING ==========

    /**
     * GET /admin/properties/stats
     * Statistiques globales des propriétés par statut
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getPropertyStatistics(
            @RequestHeader("X-User-Role") String role) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            Map<String, Object> stats = propertyService.getPropertyStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
    }

    /**
     * GET /admin/properties/by-status/{status}
     * Liste des propriétés par statut (pour admin)
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<PropertyResponse>> getPropertiesByStatus(
            @PathVariable PropertyStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("X-User-Role") String role) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<PropertyDto> properties = propertyService.getPropertiesByStatus(status, pageable);

            Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * GET /admin/properties/all
     * Liste TOUTES les propriétés (tous statuts) - Admin uniquement
     */
    @GetMapping("/all")
    public ResponseEntity<Page<PropertyResponse>> getAllPropertiesAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) PropertyStatus status,
            @RequestHeader("X-User-Role") String role) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<PropertyDto> properties;

            if (status != null) {
                properties = propertyService.getPropertiesByStatus(status, pageable);
            } else {
                properties = propertyService.getAllPropertiesIncludingDeleted(pageable);
            }

            Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * GET /admin/properties/{propertyId}/history
     * Historique des changements de statut d'une propriété
     */
    @GetMapping("/{propertyId}/history")
    public ResponseEntity<?> getPropertyStatusHistory(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Role") String role) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            List<Map<String, Object>> history = propertyService.getPropertyStatusHistory(propertyId);

            Map<String, Object> result = new HashMap<>();
            result.put("propertyId", propertyId);
            result.put("history", history);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ========== GESTION FORCÉE ==========

    /**
     * PATCH /admin/properties/{propertyId}/force-status
     * Forcer un changement de statut (bypass les règles normales)
     */
    @PatchMapping("/{propertyId}/force-status")
    public ResponseEntity<?> forceStatusChange(
            @PathVariable String propertyId,
            @RequestParam PropertyStatus status,
            @RequestHeader("X-User-Id") String adminId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody(required = false) Map<String, String> body) {

        try {
            if (!"ADMIN".equals(role)) {
                throw new RuntimeException("Access denied: Admin role required");
            }

            String reason = body != null ? body.get("reason") : "Admin override";

            PropertyDto updatedProperty = propertyService.adminForceStatusChange(
                    propertyId, status, adminId, reason);

            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Status forcé avec succès");
            result.put("property", response);
            result.put("changedBy", adminId);
            result.put("reason", reason);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }


    // ========== HELPER ==========

    private PropertyResponse convertDtoToResponse(PropertyDto dto) {
        PropertyResponse response = new PropertyResponse();
        BeanUtils.copyProperties(dto, response);
        response.setOwnerId(dto.getUserId());
        return response;
    }



}