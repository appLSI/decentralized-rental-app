package ma.fstt.listingservice.services.impl;

import ma.fstt.listingservice.dto.CharacteristicDto;
import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.entities.PropertyEntity;
import ma.fstt.listingservice.entities.PropertyStatus;
import ma.fstt.listingservice.producer.RabbitMQProducer;
import ma.fstt.listingservice.repositories.CharacteristicRepository;
import ma.fstt.listingservice.repositories.OwnerRepository;
import ma.fstt.listingservice.repositories.PropertyRepository;
import ma.fstt.listingservice.services.PropertyService;
import ma.fstt.listingservice.shared.PropertyIdGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;


import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyServiceImpl implements PropertyService {

    private static final Logger log = LoggerFactory.getLogger(PropertyServiceImpl.class);

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private CharacteristicRepository characteristicRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private PropertyIdGenerator propertyIdGenerator;

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    // ========== CREATE ==========

    @Override
    @Transactional
    public PropertyDto createProperty(PropertyDto propertyDto, String userId) {
        // Récupérer l'Owner
        Owner owner = ownerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Owner not found with userId: " + userId +
                                ". Please ensure user is synchronized from Auth Service."));

        // Vérifier wallet address
        if (owner.getWalletAddress() == null || owner.getWalletAddress().trim().isEmpty()) {
            throw new RuntimeException(
                    "Cannot create property: Owner does not have a wallet address. " +
                            "Please add a wallet address in your profile first.");
        }

        PropertyEntity propertyEntity = new PropertyEntity();
        BeanUtils.copyProperties(propertyDto, propertyEntity, "characteristics", "owner", "status");

        // Générer propertyId unique
        propertyEntity.setPropertyId(propertyIdGenerator.generatePropertyId(20));
        propertyEntity.setOwner(owner);
        propertyEntity.setOwnerId(userId);

        // ✅ NOUVEAU: Définir status initial = DRAFT
        propertyEntity.setStatus(PropertyStatus.DRAFT);

        // Sauvegarder
        PropertyEntity savedProperty = propertyRepository.save(propertyEntity);

        // Lier les caractéristiques
        if (propertyDto.getCharacteristics() != null && !propertyDto.getCharacteristics().isEmpty()) {
            for (CharacteristicDto charDto : propertyDto.getCharacteristics()) {
                Characteristic characteristic = characteristicRepository.findById(charDto.getId())
                        .orElseThrow(() -> new RuntimeException(
                                "Characteristic not found with ID: " + charDto.getId()));
                savedProperty.addCharacteristic(characteristic);
            }
            savedProperty = propertyRepository.save(savedProperty);
        }

        // Vérifier si c'est la PREMIÈRE property → Upgrade vers HOST
        Long totalProperties = propertyRepository.countByOwnerIdAndStatusNot(userId, PropertyStatus.DELETED);
        if (totalProperties == 1) {
            log.info("🎯 First property created for userId={}. Publishing user.type.upgraded event", userId);
            rabbitMQProducer.publishUserTypeUpgraded(userId, "HOST");
        }

        return convertToDto(savedProperty);
    }

    // ========== READ ==========

    @Override
    public PropertyDto getPropertyByPropertyId(String propertyId) {
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);
        if (propertyEntity == null) {
            throw new RuntimeException("Property not found with ID: " + propertyId);
        }
        return convertToDto(propertyEntity);
    }

    @Override
    public List<PropertyDto> getPropertiesByUserId(String userId) {
        // Récupérer toutes les properties SAUF DELETED
        List<PropertyEntity> properties = propertyRepository.findByOwnerIdAndStatusNot(
                userId, PropertyStatus.DELETED);
        return properties.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PropertyDto> getAllValidatedProperties(Pageable pageable) {
        // Uniquement properties ACTIVE (visibles publiquement)
        Page<PropertyEntity> properties = propertyRepository.findByStatus(
                PropertyStatus.ACTIVE, pageable);
        return properties.map(this::convertToDto);
    }

    @Override
    public Page<PropertyDto> getAllByStatus(PropertyStatus status, Pageable pageable) {
        // Récupérer properties par status spécifique
        Page<PropertyEntity> properties = propertyRepository.findByStatus(status, pageable);
        return properties.map(this::convertToDto);
    }

    // ========== SEARCH ==========

    @Override
    public Page<PropertyDto> searchProperties(String city, String type, BigDecimal minPrice,
                                              BigDecimal maxPrice, Integer nbOfGuests, Pageable pageable) {
        // Recherche uniquement dans properties ACTIVE
        Page<PropertyEntity> properties = propertyRepository.searchProperties(
                city, type, minPrice, maxPrice, nbOfGuests, PropertyStatus.ACTIVE, pageable);
        return properties.map(this::convertToDto);
    }

    @Override
    public Page<PropertyDto> findPropertiesNearby(Double latitude, Double longitude,
                                                  Double radius, Pageable pageable) {
        // Recherche géographique uniquement ACTIVE
        Page<PropertyEntity> properties = propertyRepository.findPropertiesNearby(
                latitude, longitude, radius, PropertyStatus.ACTIVE.name(), pageable);
        return properties.map(this::convertToDto);
    }

    // ========== UPDATE ==========

    @Override
    @Transactional
    public PropertyDto updateProperty(String propertyId, PropertyDto propertyDto, String userId) {
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        // Vérifier si property est éditable
        if (!propertyEntity.getStatus().isEditable()) {
            throw new RuntimeException(
                    "Property in status " + propertyEntity.getStatus() + " cannot be edited. " +
                            "Only DRAFT and PENDING properties can be modified.");
        }

        // Mettre à jour les champs
        if (propertyDto.getTitle() != null) propertyEntity.setTitle(propertyDto.getTitle());
        if (propertyDto.getType() != null) propertyEntity.setType(propertyDto.getType());
        if (propertyDto.getPricePerNight() != null) propertyEntity.setPricePerNight(propertyDto.getPricePerNight());
        if (propertyDto.getNbOfGuests() != null) propertyEntity.setNbOfGuests(propertyDto.getNbOfGuests());
        if (propertyDto.getNbOfBedrooms() != null) propertyEntity.setNbOfBedrooms(propertyDto.getNbOfBedrooms());
        if (propertyDto.getNbOfBeds() != null) propertyEntity.setNbOfBeds(propertyDto.getNbOfBeds());
        if (propertyDto.getNbOfBathrooms() != null) propertyEntity.setNbOfBathrooms(propertyDto.getNbOfBathrooms());
        if (propertyDto.getLatitude() != null) propertyEntity.setLatitude(propertyDto.getLatitude());
        if (propertyDto.getLongitude() != null) propertyEntity.setLongitude(propertyDto.getLongitude());
        if (propertyDto.getAddressName() != null) propertyEntity.setAddressName(propertyDto.getAddressName());
        if (propertyDto.getCity() != null) propertyEntity.setCity(propertyDto.getCity());
        if (propertyDto.getCountry() != null) propertyEntity.setCountry(propertyDto.getCountry());
        if (propertyDto.getState() != null) propertyEntity.setState(propertyDto.getState());
        if (propertyDto.getCodePostale() != null) propertyEntity.setCodePostale(propertyDto.getCodePostale());

        // Mettre à jour characteristics
        if (propertyDto.getCharacteristics() != null) {
            propertyEntity.getCharacteristics().clear();
            for (CharacteristicDto charDto : propertyDto.getCharacteristics()) {
                Characteristic characteristic = characteristicRepository.findById(charDto.getId())
                        .orElseThrow(() -> new RuntimeException("Characteristic not found: " + charDto.getId()));
                propertyEntity.addCharacteristic(characteristic);
            }
        }

        PropertyEntity updatedProperty = propertyRepository.save(propertyEntity);
        return convertToDto(updatedProperty);
    }

    @Override
    @Transactional
    public PropertyDto updatePropertyStatus(String propertyId, Boolean isHidden, Boolean isDraft,
                                            Boolean isValidated, String userId) {
        // ⚠️ DEPRECATED: Cette méthode existe pour compatibilité
        // Utiliser updatePropertyStatusEnum() à la place

        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        // Mapper booléens vers ENUM (logique de migration)
        PropertyStatus newStatus = mapBooleansToStatus(isHidden, isDraft, isValidated);

        // Valider transition
        validateStatusTransition(propertyEntity.getStatus(), newStatus, userId);

        propertyEntity.setStatus(newStatus);
        PropertyEntity updatedProperty = propertyRepository.save(propertyEntity);
        return convertToDto(updatedProperty);
    }

    /**
     * ✅ NOUVELLE MÉTHODE: Mettre à jour status avec ENUM
     */
    @Override
    @Transactional
    public PropertyDto updatePropertyStatusEnum(String propertyId, PropertyStatus newStatus, String userId) {
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        // Valider transition
        validateStatusTransition(propertyEntity.getStatus(), newStatus, userId);

        propertyEntity.setStatus(newStatus);
        PropertyEntity updatedProperty = propertyRepository.save(propertyEntity);

        log.info("✅ Property {} status changed: {} → {}", propertyId,
                propertyEntity.getStatus(), newStatus);

        return convertToDto(updatedProperty);
    }

    // ========== DELETE ==========

    @Override
    @Transactional
    public void deleteProperty(String propertyId, String userId) {
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this property");
        }

        // ✅ Soft delete: Changer status vers DELETED
        propertyEntity.setStatus(PropertyStatus.DELETED);
        propertyRepository.save(propertyEntity);

        log.info("🗑️ Property {} marked as DELETED by user {}", propertyId, userId);
    }

    // ========== IMAGES ==========

    @Override
    @Transactional
    public List<String> uploadPropertyImages(String propertyId, List<MultipartFile> images, String userId) {
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        List<String> uploadedPaths = imageStorageService.storeImages(propertyId, images);
        propertyEntity.getImageFolderPath().addAll(uploadedPaths);
        propertyRepository.save(propertyEntity);

        return uploadedPaths;
    }

    @Override
    @Transactional
    public void deletePropertyImage(String propertyId, String imagePath, String userId) {
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        imageStorageService.deleteImage(imagePath);
        propertyEntity.getImageFolderPath().remove(imagePath);
        propertyRepository.save(propertyEntity);
    }

    // ========== COUNT ==========

    @Override
    public Long countPropertiesByOwner(String userId) {
        // Compter toutes les properties NON-DELETED
        return propertyRepository.countByOwnerIdAndStatusNot(userId, PropertyStatus.DELETED);
    }

    @Override
    public Long countActivePropertiesByOwner(String ownerId) {
        // Vérifier que owner existe
        if (!ownerRepository.existsByUserId(ownerId)) {
            log.warn("⚠️ Owner not found: {}", ownerId);
            return 0L;
        }

        // ✅ Compter uniquement properties ACTIVE
        Long count = propertyRepository.countByOwnerIdAndStatus(ownerId, PropertyStatus.ACTIVE);
        log.info("✅ Active properties for {}: {}", ownerId, count);
        return count;
    }

    // ========== WORKFLOW STATUS ==========

    @Override
    @Transactional
    public PropertyDto submitPropertyForValidation(String propertyId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (property.getStatus() != PropertyStatus.DRAFT) {
            throw new RuntimeException(
                    "Property must be in DRAFT status to submit. Current status: " + property.getStatus());
        }

        // Transition DRAFT → PENDING
        property.setStatus(PropertyStatus.PENDING);
        PropertyEntity updated = propertyRepository.save(property);

        log.info("📤 Property {} submitted for validation (DRAFT → PENDING)", propertyId);

        return convertToDto(updated);
    }

    @Override
    @Transactional
    public PropertyDto validateProperty(String propertyId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (property.getStatus() != PropertyStatus.PENDING) {
            throw new RuntimeException(
                    "Property must be PENDING to validate. Current status: " + property.getStatus());
        }

        // Transition PENDING → ACTIVE
        property.setStatus(PropertyStatus.ACTIVE);
        PropertyEntity updated = propertyRepository.save(property);

        log.info("✅ Property {} validated by admin (PENDING → ACTIVE)", propertyId);

        return convertToDto(updated);
    }

    // ========== HELPERS ==========

    /**
     * Valider les transitions de status selon machine à états
     */
    private void validateStatusTransition(PropertyStatus from, PropertyStatus to, String userId) {
        if (!from.canTransitionTo(to)) {
            throw new IllegalStateException(
                    String.format("Invalid status transition: %s → %s not allowed", from, to));
        }

        // ✅ CRITIQUE: Vérifier wallet avant ACTIVE (Gemini requirement)
        if (to == PropertyStatus.ACTIVE) {
            Owner owner = ownerRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Owner not found"));

            if (owner.getWalletAddress() == null || owner.getWalletAddress().trim().isEmpty()) {
                throw new IllegalStateException(
                        "Cannot activate property: Owner must connect a wallet address first. " +
                                "Please add a wallet in your profile before making this property active.");
            }

            log.info("✅ Wallet validation passed for userId={}: wallet={}",
                    userId, owner.getWalletAddress());
        }

        // TODO: Règle future - ACTIVE → DELETED uniquement si aucune booking active
        // if (to == PropertyStatus.DELETED) {
        //     Long activeBookings = bookingClient.countActiveBookings(propertyId);
        //     if (activeBookings > 0) {
        //         throw new IllegalStateException("Cannot delete property with active bookings");
        //     }
        // }
    }

    /**
     * Mapper anciens booléens vers ENUM (pour migration/compatibilité)
     */
    private PropertyStatus mapBooleansToStatus(Boolean isHidden, Boolean isDraft, Boolean isValidated) {
        // Logique de mapping basée sur analyse des workflows
        if (isDraft != null && isDraft) {
            return PropertyStatus.DRAFT;
        }
        if (isValidated != null && isValidated) {
            if (isHidden != null && isHidden) {
                return PropertyStatus.HIDDEN;
            }
            return PropertyStatus.ACTIVE;
        }
        if (isHidden != null && isHidden && !isDraft) {
            return PropertyStatus.PENDING;
        }
        return PropertyStatus.DRAFT; // Default
    }

    /**
     * Convertir Entity → DTO
     */
    private PropertyDto convertToDto(PropertyEntity entity) {
        PropertyDto dto = new PropertyDto();
        BeanUtils.copyProperties(entity, dto, "characteristics");

        dto.setUserId(entity.getOwnerId());

        if (entity.getImageFolderPath() != null) {
            dto.setImageFolderPath(entity.getImageFolderPath());
        }

        if (entity.getCharacteristics() != null && !entity.getCharacteristics().isEmpty()) {
            List<CharacteristicDto> characteristicDtos = entity.getCharacteristics().stream()
                    .map(this::convertCharacteristicToDto)
                    .collect(Collectors.toList());
            dto.setCharacteristics(characteristicDtos);
        }

        return dto;
    }

    private CharacteristicDto convertCharacteristicToDto(Characteristic characteristic) {
        CharacteristicDto dto = new CharacteristicDto();
        dto.setId(characteristic.getId());
        dto.setName(characteristic.getName());
        dto.setIconPath(characteristic.getIconPath());
        dto.setIsActive(characteristic.getIsActive());

        if (characteristic.getTypeCaracteristique() != null) {
            dto.setTypeCaracteristiqueId(characteristic.getTypeCaracteristique().getId());
            dto.setTypeCaracteristiqueName(characteristic.getTypeCaracteristique().getName());
        }

        return dto;
    }

    @Override
    public PropertyDto addImagesToProperty(String propertyId, List<String> newImagePaths, String userId) {
        log.info("🖼️ Adding {} images to property {}", newImagePaths.size(), propertyId);

        // 1. Récupérer la propriété par propertyId (String)
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found with id: " + propertyId);
        }

        // 2. Vérifier ownership
        if (!propertyEntity.getOwnerId().equals(userId)) {
            log.error("❌ User {} is not the owner of property {}", userId, propertyId);
            throw new RuntimeException("You are not authorized to modify this property");
        }

        // 3. Récupérer ou créer la liste d'images
        List<String> currentImages = propertyEntity.getImageFolderPath();
        if (currentImages == null) {
            currentImages = new ArrayList<>();
            log.info("📝 No existing images, creating new list");
        } else {
            log.info("📝 Found {} existing images", currentImages.size());
        }

        // 4. Ajouter les nouvelles images
        currentImages.addAll(newImagePaths);
        propertyEntity.setImageFolderPath(currentImages);

        // 5. Sauvegarder
        PropertyEntity updatedProperty = propertyRepository.save(propertyEntity);

        log.info("✅ Successfully added {} new images. Total: {}",
                newImagePaths.size(), updatedProperty.getImageFolderPath().size());

        // 6. Convertir et retourner
        return convertToDto(updatedProperty);
    }

    /**
     * ✅ ADD THIS METHOD TO PropertyServiceImpl CLASS
     * Location: ma.fstt.listingservice.services.impl.PropertyServiceImpl
     *
     * Add this import at the top:
     * import java.util.stream.Collectors;
     */

    @Override
    public List<String> getPropertyIdsByOwner(String ownerId) {
        log.info("📋 Fetching property IDs for owner: {}", ownerId);

        // Retrieve all properties for the owner (excluding DELETED)
        List<PropertyEntity> properties = propertyRepository.findByOwnerIdAndStatusNot(
                ownerId, PropertyStatus.DELETED);

        // Extract and return only the property IDs
        List<String> propertyIds = properties.stream()
                .map(PropertyEntity::getPropertyId)
                .collect(Collectors.toList());

        log.info("✅ Found {} properties for owner {}", propertyIds.size(), ownerId);
        return propertyIds;
    }

    // ✅ AJOUTEZ CETTE MÉTHODE DANS PropertyServiceImpl.java

    /**
     * 💰 Récupérer l'adresse wallet d'un owner
     *
     * @param ownerId ID de l'owner (userId)
     * @return Adresse wallet ou null
     */
    public String getOwnerWalletAddress(String ownerId) {
        log.info("🔍 Fetching wallet address for owner: {}", ownerId);

        Owner owner = ownerRepository.findByUserId(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found with userId: " + ownerId));

        String walletAddress = owner.getWalletAddress();

        if (walletAddress == null || walletAddress.trim().isEmpty()) {
            log.warn("⚠️ Owner {} has no wallet address", ownerId);
            return null;
        }

        log.info("✅ Wallet address found for owner {}: {}", ownerId, walletAddress);
        return walletAddress;
    }
}