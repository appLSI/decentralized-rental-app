package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.TypeCharacteristique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeCaracteristiqueRepository extends JpaRepository<TypeCharacteristique, Long> {

    Optional<TypeCharacteristique> findByName(String name);
}