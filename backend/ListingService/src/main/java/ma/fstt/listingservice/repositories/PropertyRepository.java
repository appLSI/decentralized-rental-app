package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.PropertyEntity;
import ma.fstt.listingservice.entities.PropertyStatus;
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

    // ========== MÉTHODES DE BASE ==========

    PropertyEntity findByPropertyId(String propertyId);

    // ========== MÉTHODES AVEC ENUM STATUS ==========

    /**
     * Trouver properties par owner et status
     */
    List<PropertyEntity> findByOwnerIdAndStatus(String ownerId, PropertyStatus status);

    /**
     * Trouver properties par owner SAUF un certain status
     * Ex: Toutes les properties sauf DELETED
     */
    List<PropertyEntity> findByOwnerIdAndStatusNot(String ownerId, PropertyStatus status);

    /**
     * Trouver properties par status (avec pagination)
     */
    Page<PropertyEntity> findByStatus(PropertyStatus status, Pageable pageable);

    /**
     * Trouver properties avec plusieurs status possibles
     * Ex: ACTIVE ou HIDDEN
     */
    Page<PropertyEntity> findByStatusIn(List<PropertyStatus> statuses, Pageable pageable);

    /**
     * Compter properties par owner et status
     */
    Long countByOwnerIdAndStatus(String ownerId, PropertyStatus status);

    /**
     * Compter properties par owner SAUF un status
     * Ex: Compter toutes les properties non-supprimées
     */
    Long countByOwnerIdAndStatusNot(String ownerId, PropertyStatus status);

    /**
     * Recherche par ville avec status ACTIVE uniquement
     */
    Page<PropertyEntity> findByCityAndStatus(String city, PropertyStatus status, Pageable pageable);

    /**
     * Recherche par type avec status ACTIVE uniquement
     */
    Page<PropertyEntity> findByTypeAndStatus(String type, PropertyStatus status, Pageable pageable);

    // ========== RECHERCHES AVANCÉES ==========

    /**
     * Recherche avancée avec critères multiples (ACTIVE uniquement)
     */
    @Query("SELECT p FROM PropertyEntity p WHERE " +
            "(:city IS NULL OR p.city = :city) " +
            "AND (:type IS NULL OR p.type = :type) " +
            "AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice) " +
            "AND (:nbOfGuests IS NULL OR p.nbOfGuests >= :nbOfGuests) " +
            "AND p.status = :status")
    Page<PropertyEntity> searchProperties(
            @Param("city") String city,
            @Param("type") String type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("nbOfGuests") Integer nbOfGuests,
            @Param("status") PropertyStatus status,
            Pageable pageable
    );

    /**
     * Recherche géographique (rayon en km) - ACTIVE uniquement
     */
    @Query(value = "SELECT * FROM properties p WHERE " +
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * " +
            "cos(radians(p.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(p.latitude)))) <= :radius " +
            "AND p.status = :status",
            countQuery = "SELECT count(*) FROM properties p WHERE " +
                    "(6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * " +
                    "cos(radians(p.longitude) - radians(:longitude)) + " +
                    "sin(radians(:latitude)) * sin(radians(p.latitude)))) <= :radius " +
                    "AND p.status = :status",
            nativeQuery = true)
    Page<PropertyEntity> findPropertiesNearby(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius,
            @Param("status") String status, // String car native query
            Pageable pageable
    );


}