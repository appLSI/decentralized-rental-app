package ma.fstt.listingservice.repositories;

import ma.fstt.listingservice.entities.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {

    Optional<Owner> findByUserId(String userId);

    boolean existsByUserId(String userId);

}