package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

    List<PropertyImage> findByPropertyIdOrderByDisplayOrderAsc(Long propertyId);

    List<PropertyImage> findByPropertyId(Long propertyId);
}