package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.PropertyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharacteristicRepository extends JpaRepository<Characteristic, Long> {

    List<Characteristic> findByProperties(List<PropertyEntity> properties);

    void deleteByProperties(List<PropertyEntity> properties);
}
