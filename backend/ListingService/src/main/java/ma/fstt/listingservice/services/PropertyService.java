package ma.fstt.listingservice.services;

import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.enums.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyService {

    /**
     * Créer une nouvelle propriété
     * Par défaut, elle sera en statut DRAFT
     */
    PropertyDto createProperty(PropertyDto propertyDto, String userId);

    /**
     * Récupérer une propriété par son ID
     */
    PropertyDto getPropertyByPropertyId(String propertyId);

    /**
     * Récupérer toutes les propriétés d'un utilisateur (exclut DELETED)
     */
    List<PropertyDto> getPropertiesByUserId(String userId);

    /**
     * Récupérer toutes les propriétés validées et actives (statut ACTIVE)
     */
    Page<PropertyDto> getAllValidatedProperties(Pageable pageable);

    /**
     * Rechercher des propriétés avec critères (uniquement statut ACTIVE)
     */
    Page<PropertyDto> searchProperties(String city, String type, BigDecimal minPrice,
                                       BigDecimal maxPrice, Integer nbOfGuests, Pageable pageable);

    /**
     * Trouver des propriétés à proximité (uniquement statut ACTIVE)
     */
    Page<PropertyDto> findPropertiesNearby(Double latitude, Double longitude,
                                           Double radius, Pageable pageable);

    /**
     * Mettre à jour les informations d'une propriété
     * Uniquement si le statut le permet (DRAFT, PENDING_VALIDATION, REJECTED)
     */
    PropertyDto updateProperty(String propertyId, PropertyDto propertyDto, String userId);

    /**
     * ✅ NOUVEAU: Changer le statut d'une propriété
     * Valide automatiquement les transitions autorisées
     */
    PropertyDto updatePropertyStatus(String propertyId, PropertyStatus newStatus, String userId);

    /**
     * Supprimer une propriété (soft delete - passe au statut DELETED)
     */
    void deleteProperty(String propertyId, String userId);

    /**
     * Uploader des images pour une propriété
     */
    List<String> uploadPropertyImages(String propertyId, List<MultipartFile> images, String userId);

    /**
     * Supprimer une image d'une propriété
     */
    void deletePropertyImage(String propertyId, String imagePath, String userId);

    /**
     * Compter le nombre de propriétés d'un propriétaire (exclut DELETED)
     */
    Long countPropertiesByOwner(String userId);

    /**
     * Compter le nombre de propriétés actives d'un propriétaire (statut ACTIVE uniquement)
     */
    Long countActivePropertiesByOwner(String userId);
}