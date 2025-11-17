package ma.fstt.listingservice.controller;

import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.enums.PropertyStatus;
import ma.fstt.listingservice.requests.PropertyRequest;
import ma.fstt.listingservice.responses.PropertyResponse;
import ma.fstt.listingservice.services.PropertyService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/properties")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProperty(
            @RequestBody PropertyRequest propertyRequest,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto propertyDto = new PropertyDto();
            BeanUtils.copyProperties(propertyRequest, propertyDto);

            PropertyDto createdProperty = propertyService.createProperty(propertyDto, ownerId);
            PropertyResponse response = convertDtoToResponse(createdProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété créée avec succès");
            result.put("property", response);

            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<?> getProperty(@PathVariable String propertyId) {
        try {
            PropertyDto propertyDto = propertyService.getPropertyByPropertyId(propertyId);
            PropertyResponse response = convertDtoToResponse(propertyDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PropertyResponse>> getPropertiesByOwner(@PathVariable String ownerId) {
        List<PropertyDto> properties = propertyService.getPropertiesByUserId(ownerId);
        List<PropertyResponse> responses = properties.stream()
                .map(this::convertDtoToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my-properties")
    public ResponseEntity<List<PropertyResponse>> getMyProperties(
            @RequestHeader("X-User-Id") String ownerId) {
        return getPropertiesByOwner(ownerId);
    }

    @GetMapping
    public ResponseEntity<Page<PropertyResponse>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PropertyDto> properties = propertyService.getAllValidatedProperties(pageable);
        Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer nbOfGuests,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PropertyDto> properties = propertyService.searchProperties(
                city, type, minPrice, maxPrice, nbOfGuests, pageable);
        Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<PropertyResponse>> findPropertiesNearby(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radius,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PropertyDto> properties = propertyService.findPropertiesNearby(
                latitude, longitude, radius, pageable);
        Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{propertyId}")
    public ResponseEntity<?> updateProperty(
            @PathVariable String propertyId,
            @RequestBody PropertyRequest propertyRequest,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto propertyDto = new PropertyDto();
            BeanUtils.copyProperties(propertyRequest, propertyDto);

            PropertyDto updatedProperty = propertyService.updateProperty(propertyId, propertyDto, ownerId);
            PropertyResponse response = convertDtoToResponse(updatedProperty);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ✅ NOUVEAU: Endpoint pour changer le status
    @PatchMapping("/{propertyId}/status")
    public ResponseEntity<?> updatePropertyStatus(
            @PathVariable String propertyId,
            @RequestParam PropertyStatus status,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto updatedProperty = propertyService.updatePropertyStatus(propertyId, status, ownerId);
            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Status mis à jour avec succès");
            result.put("property", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ✅ NOUVEAU: Endpoints spécifiques pour actions courantes
    @PostMapping("/{propertyId}/submit")
    public ResponseEntity<?> submitForValidation(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto updatedProperty = propertyService.updatePropertyStatus(
                    propertyId, PropertyStatus.PENDING_VALIDATION, ownerId);
            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété soumise pour validation");
            result.put("property", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{propertyId}/hide")
    public ResponseEntity<?> hideProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto updatedProperty = propertyService.updatePropertyStatus(
                    propertyId, PropertyStatus.HIDDEN, ownerId);
            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété cachée");
            result.put("property", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{propertyId}/unhide")
    public ResponseEntity<?> unhideProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto updatedProperty = propertyService.updatePropertyStatus(
                    propertyId, PropertyStatus.ACTIVE, ownerId);
            PropertyResponse response = convertDtoToResponse(updatedProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété visible à nouveau");
            result.put("property", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Map<String, String>> deleteProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            propertyService.deleteProperty(propertyId, ownerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Propriété supprimée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{propertyId}/images")
    public ResponseEntity<?> uploadImages(
            @PathVariable String propertyId,
            @RequestParam("images") List<MultipartFile> images,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            List<String> uploadedPaths = propertyService.uploadPropertyImages(propertyId, images, ownerId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Images uploadées avec succès");
            response.put("imagePaths", uploadedPaths);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{propertyId}/images")
    public ResponseEntity<Map<String, String>> deleteImage(
            @PathVariable String propertyId,
            @RequestParam String imagePath,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            propertyService.deletePropertyImage(propertyId, imagePath, ownerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Image supprimée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/owner/{ownerId}/count")
    public ResponseEntity<Map<String, Long>> countPropertiesByOwner(@PathVariable String ownerId) {
        Long count = propertyService.countPropertiesByOwner(ownerId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/owner/{ownerId}/active-count")
    public ResponseEntity<Map<String, Long>> countActivePropertiesByOwner(@PathVariable String ownerId) {
        try {
            Long count = propertyService.countActivePropertiesByOwner(ownerId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Long> error = new HashMap<>();
            error.put("count", 0L);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private PropertyResponse convertDtoToResponse(PropertyDto dto) {
        PropertyResponse response = new PropertyResponse();
        BeanUtils.copyProperties(dto, response);
        response.setOwnerId(dto.getUserId());
        return response;
    }
}