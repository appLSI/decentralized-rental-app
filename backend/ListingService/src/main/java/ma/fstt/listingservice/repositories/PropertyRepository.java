package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.PropertyEntity;
import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.enums.PropertyStatus;
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

    // ✅ NOUVEAU: Find by status
    Page<PropertyEntity> findByStatus(PropertyStatus status, Pageable pageable);

    List<PropertyEntity> findByStatus(PropertyStatus status);

    // ✅ NOUVEAU: Find by ownerId and exclude a status
    List<PropertyEntity> findByOwnerIdAndStatusNot(String ownerId, PropertyStatus status);

    // ✅ NOUVEAU: Find by ownerId and specific status
    List<PropertyEntity> findByOwnerIdAndStatus(String ownerId, PropertyStatus status);

    // ✅ NOUVEAU: Find by multiple statuses
    List<PropertyEntity> findByStatusIn(List<PropertyStatus> statuses);

    Page<PropertyEntity> findByStatusIn(List<PropertyStatus> statuses, Pageable pageable);

    // ✅ MODIFIÉ: Advanced search with status filter
    @Query("SELECT p FROM PropertyEntity p WHERE " +
            "(:city IS NULL OR p.city = :city) " +
            "AND (:type IS NULL OR p.type = :type) " +
            "AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) " +
            "AND (:nbOfGuests IS NULL OR p.nbOfGuests >= :nbOfGuests) " +
            "AND p.status = 'ACTIVE'")
    Page<PropertyEntity> searchProperties(@Param("city") String city,
                                          @Param("type") String type,
                                          @Param("minPrice") BigDecimal minPrice,
                                          @Param("maxPrice") BigDecimal maxPrice,
                                          @Param("nbOfGuests") Integer nbOfGuests,
                                          Pageable pageable);

    // ✅ MODIFIÉ: Search properties within a geographical radius
    @Query(value = "SELECT * FROM properties p WHERE " +
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * " +
            "cos(radians(p.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(p.latitude)))) <= :radius " +
            "AND p.status = 'ACTIVE'",
            countQuery = "SELECT count(*) FROM properties p WHERE " +
                    "(6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * " +
                    "cos(radians(p.longitude) - radians(:longitude)) + " +
                    "sin(radians(:latitude)) * sin(radians(p.latitude)))) <= :radius " +
                    "AND p.status = 'ACTIVE'",
            nativeQuery = true)
    Page<PropertyEntity> findPropertiesNearby(@Param("latitude") Double latitude,
                                              @Param("longitude") Double longitude,
                                              @Param("radius") Double radius,
                                              Pageable pageable);

    // ✅ NOUVEAU: Count by ownerId and exclude a status
    Long countByOwnerIdAndStatusNot(String ownerId, PropertyStatus status);

    // ✅ NOUVEAU: Count by owner and specific status
    Long countByOwnerAndStatus(Owner owner, PropertyStatus status);

    // ✅ NOUVEAU: Count by multiple statuses
    Long countByStatusIn(List<PropertyStatus> statuses);

    // ✅ NOUVEAU: Find properties by owner with specific statuses
    @Query("SELECT p FROM PropertyEntity p WHERE p.owner = :owner AND p.status IN :statuses")
    List<PropertyEntity> findByOwnerAndStatusIn(@Param("owner") Owner owner,
                                                @Param("statuses") List<PropertyStatus> statuses);

    // ✅ NOUVEAU: Statistics - count properties by status
    @Query("SELECT p.status, COUNT(p) FROM PropertyEntity p GROUP BY p.status")
    List<Object[]> countPropertiesByStatus();

    // ✅ NOUVEAU: Find properties needing validation
    List<PropertyEntity> findByStatusOrderByCreatedAtAsc(PropertyStatus status);

    // ✅ NOUVEAU: Find owner's active properties
    @Query("SELECT p FROM PropertyEntity p WHERE p.owner = :owner AND p.status = 'ACTIVE'")
    List<PropertyEntity> findActivePropertiesByOwner(@Param("owner") Owner owner);


    /**
     * Compter les propriétés par statut
     */
    Long countByStatus(PropertyStatus status);
}