package ma.fstt.listingservice.controller;

import ma.fstt.listingservice.entities.TypeCharacteristique;
import ma.fstt.listingservice.repositories.TypeCaracteristiqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/type-caracteristiques")
public class TypeCaracteristiqueController {

    @Autowired
    private TypeCaracteristiqueRepository typeCaracteristiqueRepository;

    /**
     * Récupérer tous les types de caractéristiques
     */
    @GetMapping
    public ResponseEntity<List<TypeCharacteristique>> getAllTypes() {
        List<TypeCharacteristique> types = typeCaracteristiqueRepository.findAll();
        return ResponseEntity.ok(types);
    }

    /**
     * Récupérer un type par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TypeCharacteristique> getTypeById(@PathVariable Long id) {
        return typeCaracteristiqueRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Créer un nouveau type de caractéristique
     */
    @PostMapping
    public ResponseEntity<TypeCharacteristique> createType(@RequestBody TypeCharacteristique type) {
        TypeCharacteristique savedType = typeCaracteristiqueRepository.save(type);
        return ResponseEntity.ok(savedType);
    }
}