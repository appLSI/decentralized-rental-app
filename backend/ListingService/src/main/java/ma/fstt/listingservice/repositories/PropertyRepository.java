package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.PropertyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<PropertyEntity, Long> {

    // Find PropertyEntity by propertyId
    PropertyEntity findByPropertyId(String propertyId);

    // Find Properties by ownerId (this works with the ownerId field in PropertyEntity)
    List<PropertyEntity> findByOwnerId(String ownerId);

    // Find Properties by ownerId and isDeleted flag
    List<PropertyEntity> findByOwnerIdAndIsDeleted(String ownerId, Boolean isDeleted);

    // Find validated and not deleted properties
    Page<PropertyEntity> findByIsValidatedAndIsDeleted(Boolean isValidated, Boolean isDeleted, Pageable pageable);

    // Search properties by city, validated status, and deleted status
    Page<PropertyEntity> findByCityAndIsValidatedAndIsDeleted(String city, Boolean isValidated, Boolean isDeleted, Pageable pageable);

    // Search properties by type, validated status, and deleted status
    Page<PropertyEntity> findByTypeAndIsValidatedAndIsDeleted(String type, Boolean isValidated, Boolean isDeleted, Pageable pageable);

    // Advanced search with multiple criteria
    @Query("SELECT p FROM PropertyEntity p WHERE (:city IS NULL OR p.city = :city) " +
            "AND (:type IS NULL OR p.type = :type) " +
            "AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) " +
            "AND (:nbOfGuests IS NULL OR p.nbOfGuests >= :nbOfGuests) " +
            "AND p.isValidated = true " +
            "AND p.isDeleted = false")
    Page<PropertyEntity> searchProperties(String city, String type, BigDecimal minPrice,
                                          BigDecimal maxPrice, Integer nbOfGuests, Pageable pageable);

    // Search properties within a geographical radius (in km)
    @Query(value = "SELECT * FROM properties p WHERE (6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(p.latitude)))) <= :radius AND p.is_validated = true AND p.is_deleted = false",
            countQuery = "SELECT count(*) FROM properties p WHERE (6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(p.latitude)))) <= :radius AND p.is_validated = true AND p.is_deleted = false",
            nativeQuery = true)
    Page<PropertyEntity> findPropertiesNearby(@Param("latitude") Double latitude,
                                              @Param("longitude") Double longitude,
                                              @Param("radius") Double radius,
                                              Pageable pageable);

    // Count properties by ownerId and deletion status
    Long countByOwnerIdAndIsDeleted(String ownerId, Boolean isDeleted);
}
