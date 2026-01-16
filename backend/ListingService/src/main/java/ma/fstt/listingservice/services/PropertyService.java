package ma.fstt.listingservice.services;

import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.entities.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyService {

    // ========== CREATE ==========
    PropertyDto createProperty(PropertyDto propertyDto, String ownerId);

    // ========== READ ==========
    PropertyDto getPropertyByPropertyId(String propertyId);

    List<PropertyDto> getPropertiesByUserId(String userId);

    Page<PropertyDto> getAllValidatedProperties(Pageable pageable);

    // ✅ NOUVEAU: Récupérer properties par status
    Page<PropertyDto> getAllByStatus(PropertyStatus status, Pageable pageable);

    // ========== SEARCH ==========
    Page<PropertyDto> searchProperties(String city, String type, BigDecimal minPrice,
                                       BigDecimal maxPrice, Integer nbOfGuests, Pageable pageable);

    Page<PropertyDto> findPropertiesNearby(Double latitude, Double longitude,
                                           Double radius, Pageable pageable);

    // ========== UPDATE ==========
    PropertyDto updateProperty(String propertyId, PropertyDto propertyDto, String ownerId);

    /**
     * ⚠️ DEPRECATED: Utiliser updatePropertyStatusEnum() à la place
     * Méthode gardée pour compatibilité avec ancien code frontend
     */
    @Deprecated
    PropertyDto updatePropertyStatus(String propertyId, Boolean isHidden, Boolean isDraft,
                                     Boolean isValidated, String ownerId);

    /**
     * ✅ NOUVEAU: Mettre à jour status avec ENUM
     */
    PropertyDto updatePropertyStatusEnum(String propertyId, PropertyStatus newStatus, String userId);

    // ========== DELETE ==========
    void deleteProperty(String propertyId, String ownerId);

    // ========== IMAGES ==========
    List<String> uploadPropertyImages(String propertyId, List<MultipartFile> images, String ownerId);

    void deletePropertyImage(String propertyId, String imagePath, String ownerId);

    // ========== COUNT ==========
    Long countPropertiesByOwner(String ownerId);

    Long countActivePropertiesByOwner(String ownerId);

    // ========== WORKFLOW STATUS ==========
    PropertyDto submitPropertyForValidation(String propertyId);

    PropertyDto validateProperty(String propertyId);

    PropertyDto addImagesToProperty(String propertyId, List<String> newImagePaths, String userId);

    List<String> getPropertyIdsByOwner(String ownerId);

    String getOwnerWalletAddress(String ownerId);




}