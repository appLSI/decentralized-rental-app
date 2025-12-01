package ma.fstt.listingservice.services;

import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.entities.PropertyImage;
import ma.fstt.listingservice.enums.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface PropertyService {

    // ========== CRUD BASIQUE ==========

    PropertyDto createProperty(PropertyDto propertyDto, String userId);

    PropertyDto getPropertyByPropertyId(String propertyId);

    List<PropertyDto> getPropertiesByUserId(String userId);

    Page<PropertyDto> getAllValidatedProperties(Pageable pageable);

    PropertyDto updateProperty(String propertyId, PropertyDto propertyDto, String userId);

    void deleteProperty(String propertyId, String userId);

    // ========== SEARCH ==========

    Page<PropertyDto> searchProperties(String city, String type, BigDecimal minPrice,
                                       BigDecimal maxPrice, Integer nbOfGuests, Pageable pageable);

    Page<PropertyDto> findPropertiesNearby(Double latitude, Double longitude,
                                           Double radius, Pageable pageable);

    // ========== STATUS MANAGEMENT ==========

    PropertyDto updatePropertyStatus(String propertyId, PropertyStatus newStatus, String userId);

    // ========== IMAGE MANAGEMENT ==========

    List<PropertyImage> uploadPropertyImages(String propertyId, List<MultipartFile> files, String userId);

    void setMainImage(String propertyId, Long imageId, String userId);

    void deletePropertyImage(String propertyId, Long imageId, String userId);

    // ========== COUNTS ==========

    Long countPropertiesByOwner(String userId);

    Long countActivePropertiesByOwner(String userId);

    // ========== ADMIN METHODS ==========

    Page<PropertyDto> getPropertiesByStatus(PropertyStatus status, Pageable pageable);

    Page<PropertyDto> getAllPropertiesIncludingDeleted(Pageable pageable);

    PropertyDto adminValidateProperty(String propertyId, String adminId, String comment);

    PropertyDto adminRejectProperty(String propertyId, String adminId, String reason);

    PropertyDto adminSuspendProperty(String propertyId, String adminId, String reason);

    PropertyDto adminReactivateProperty(String propertyId, String adminId);

    PropertyDto adminForceStatusChange(String propertyId, PropertyStatus newStatus,
                                       String adminId, String reason);

    Map<String, Object> getPropertyStatistics();

    List<Map<String, Object>> getPropertyStatusHistory(String propertyId);
}