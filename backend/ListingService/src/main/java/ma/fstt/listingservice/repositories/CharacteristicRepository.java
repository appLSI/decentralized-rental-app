package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.PropertyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CharacteristicRepository extends JpaRepository<Characteristic, Long> {

    Optional<Characteristic> findByName(String name);

    List<Characteristic> findByProperties(List<PropertyEntity> properties);

    void deleteByProperties(List<PropertyEntity> properties);
}
