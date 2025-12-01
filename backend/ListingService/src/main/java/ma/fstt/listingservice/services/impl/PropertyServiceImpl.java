package ma.fstt.listingservice.services.impl;

import ma.fstt.listingservice.dto.CharacteristicDto;
import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.dto.PropertyImageDto;
import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.entities.PropertyEntity;
import ma.fstt.listingservice.entities.PropertyImage;
import ma.fstt.listingservice.enums.PropertyStatus;
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
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import ma.fstt.listingservice.config.RabbitMQConfig;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PropertyServiceImpl implements PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private CharacteristicRepository characteristicRepository;

    private static final Logger logger = LoggerFactory.getLogger(PropertyServiceImpl.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private PropertyIdGenerator propertyIdGenerator;

    @Autowired
    private ImageStorageService imageStorageService;

    // ========== CREATE ==========

    @Override
    @Transactional
    public PropertyDto createProperty(PropertyDto propertyDto, String userId) {
        Owner owner = ownerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with userId: " + userId + ". Please ensure user is synchronized from Auth Service."));

        if (owner.getWalletAddress() == null || owner.getWalletAddress().trim().isEmpty()) {
            throw new RuntimeException("Cannot create property: Owner does not have a wallet address. Please add a wallet address in your profile first.");
        }

        PropertyEntity propertyEntity = new PropertyEntity();
        BeanUtils.copyProperties(propertyDto, propertyEntity, "characteristics", "owner", "status", "images");

        propertyEntity.setPropertyId(propertyIdGenerator.generatePropertyId(20));
        propertyEntity.setOwner(owner);
        propertyEntity.setOwnerId(userId);

        if (propertyDto.getStatus() != null) {
            propertyEntity.setStatus(propertyDto.getStatus());
        } else {
            propertyEntity.setStatus(PropertyStatus.DRAFT);
        }

        PropertyEntity savedProperty = propertyRepository.save(propertyEntity);

        // Lier les caractéristiques
        if (propertyDto.getCharacteristics() != null && !propertyDto.getCharacteristics().isEmpty()) {
            for (CharacteristicDto charDto : propertyDto.getCharacteristics()) {
                Characteristic characteristic = characteristicRepository.findById(charDto.getId())
                        .orElseThrow(() -> new RuntimeException("Characteristic not found with ID: " + charDto.getId()));
                savedProperty.addCharacteristic(characteristic);
            }
            savedProperty = propertyRepository.save(savedProperty);
        }

        publishPropertyCreatedEvent(savedProperty);

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
        List<PropertyEntity> properties = propertyRepository.findByOwnerIdAndStatusNot(userId, PropertyStatus.DELETED);
        return properties.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PropertyDto> getAllValidatedProperties(Pageable pageable) {
        Page<PropertyEntity> properties = propertyRepository.findByStatus(PropertyStatus.ACTIVE, pageable);
        return properties.map(this::convertToDto);
    }

    @Override
    public Page<PropertyDto> searchProperties(String city, String type, BigDecimal minPrice,
                                              BigDecimal maxPrice, Integer nbOfGuests, Pageable pageable) {
        Page<PropertyEntity> properties = propertyRepository.searchProperties(
                city, type, minPrice, maxPrice, nbOfGuests, pageable);
        return properties.map(this::convertToDto);
    }

    @Override
    public Page<PropertyDto> findPropertiesNearby(Double latitude, Double longitude,
                                                  Double radius, Pageable pageable) {
        Page<PropertyEntity> properties = propertyRepository.findPropertiesNearby(
                latitude, longitude, radius, pageable);
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

        if (!propertyEntity.isEditable()) {
            throw new RuntimeException("Property cannot be edited in current status: " + propertyEntity.getStatus());
        }

        // Mettre à jour les champs de base
        if (propertyDto.getTitle() != null) propertyEntity.setTitle(propertyDto.getTitle());
        if (propertyDto.getType() != null) propertyEntity.setType(propertyDto.getType());
        if (propertyDto.getDescription() != null) propertyEntity.setDescription(propertyDto.getDescription());
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

        // Mettre à jour les caractéristiques
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
    public PropertyDto updatePropertyStatus(String propertyId, PropertyStatus newStatus, String userId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (!property.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        PropertyStatus currentStatus = property.getStatus();

        // RÈGLES DE TRANSITION POUR LES OWNERS
        if (currentStatus == PropertyStatus.DRAFT && newStatus == PropertyStatus.PENDING_VALIDATION) {
            validatePropertyComplete(property);
            property.setStatus(newStatus);
        }
        else if (currentStatus == PropertyStatus.REJECTED && newStatus == PropertyStatus.DRAFT) {
            property.setStatus(newStatus);
        }
        else if (currentStatus == PropertyStatus.ACTIVE && newStatus == PropertyStatus.HIDDEN) {
            property.setStatus(newStatus);
        }
        else if (currentStatus == PropertyStatus.HIDDEN && newStatus == PropertyStatus.ACTIVE) {
            property.setStatus(newStatus);
        }
        else if (newStatus == PropertyStatus.DELETED) {
            property.setStatus(newStatus);
        }
        else {
            throw new RuntimeException(
                    String.format("Invalid status transition from %s to %s for property owner",
                            currentStatus, newStatus)
            );
        }

        PropertyEntity updated = propertyRepository.save(property);

        logger.info("✅ Property {} status changed from {} to {} by owner {}",
                propertyId, currentStatus, newStatus, userId);

        return convertToDto(updated);
    }

    // ✅ CORRIGÉ: Validation avec nouveau système d'images
    private void validatePropertyComplete(PropertyEntity property) {
        List<String> errors = new ArrayList<>();

        if (property.getTitle() == null || property.getTitle().trim().isEmpty()) {
            errors.add("Title is required");
        }
        if (property.getDescription() == null || property.getDescription().trim().isEmpty()) {
            errors.add("Description is required");
        }
        // ✅ Vérifier les images avec le nouveau système
        if (property.getImages() == null || property.getImages().isEmpty()) {
            errors.add("At least one image is required");
        }
        if (property.getPricePerNight() == null || property.getPricePerNight().compareTo(BigDecimal.ZERO) <= 0) {
            errors.add("Valid price is required");
        }

        if (!errors.isEmpty()) {
            throw new RuntimeException("Property incomplete: " + String.join(", ", errors));
        }
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

        propertyEntity.markAsDeleted();
        propertyRepository.save(propertyEntity);
    }

    // ========== IMAGE MANAGEMENT ==========

    @Override
    @Transactional
    public List<PropertyImage> uploadPropertyImages(String propertyId,
                                                    List<MultipartFile> files,
                                                    String userId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (!property.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Upload vers S3
        List<String> s3Urls = imageStorageService.storeImages(propertyId, files);

        // Calculer l'index de départ pour displayOrder
        int currentMaxOrder = property.getImages().stream()
                .mapToInt(PropertyImage::getDisplayOrder)
                .max()
                .orElse(-1);

        // Créer les entités PropertyImage
        List<PropertyImage> newImages = new ArrayList<>();
        boolean hasMainImage = property.getImages().stream()
                .anyMatch(PropertyImage::getIsMain);

        for (int i = 0; i < s3Urls.size(); i++) {
            PropertyImage img = new PropertyImage();
            img.setProperty(property);
            img.setImageUrl(s3Urls.get(i));
            img.setDisplayOrder(currentMaxOrder + i + 1);

            // Première image uploadée = image principale si aucune n'existe
            if (!hasMainImage && i == 0) {
                img.setIsMain(true);
                hasMainImage = true;
            } else {
                img.setIsMain(false);
            }

            newImages.add(img);
            property.getImages().add(img);
        }

        // ✅ Sauvegarder et forcer le flush pour générer les IDs
        PropertyEntity savedProperty = propertyRepository.saveAndFlush(property);

        // ✅ SOLUTION: Récupérer explicitement les dernières images ajoutées
        // avec leurs IDs depuis l'entité fraîchement sauvegardée
        List<PropertyImage> savedImages = savedProperty.getImages().stream()
                .filter(img -> s3Urls.contains(img.getImageUrl()))
                .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                .collect(Collectors.toList());

        return savedImages;
    }


    @Override
    @Transactional
    public void setMainImage(String propertyId, Long imageId, String userId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (!property.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Vérifier que l'image existe
        PropertyImage targetImage = property.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // ✅ Mettre toutes les images à isMain = false
        for (PropertyImage img : property.getImages()) {
            img.setIsMain(false);
        }

        // ✅ Définir la nouvelle image principale
        targetImage.setIsMain(true);

        // ✅ Sauvegarder avec flush pour forcer la persistance
        propertyRepository.saveAndFlush(property);

        logger.info("✅ Image {} set as main for property {}", imageId, propertyId);
    }
    @Override
    @Transactional
    public void deletePropertyImage(String propertyId, Long imageId, String userId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (!property.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        PropertyImage imageToDelete = property.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // Supprimer de S3
        imageStorageService.deleteImage(imageToDelete.getImageUrl());

        // Supprimer de la collection (orphanRemoval s'en charge)
        property.getImages().remove(imageToDelete);

        // Si c'était l'image principale, assigner une nouvelle
        if (imageToDelete.getIsMain() && !property.getImages().isEmpty()) {
            property.getImages().get(0).setIsMain(true);
        }

        propertyRepository.save(property);
    }

    // ========== COUNTS ==========

    @Override
    public Long countPropertiesByOwner(String userId) {
        return propertyRepository.countByOwnerIdAndStatusNot(userId, PropertyStatus.DELETED);
    }

    @Override
    public Long countActivePropertiesByOwner(String userId) {
        Owner owner = ownerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return propertyRepository.countByOwnerAndStatus(owner, PropertyStatus.ACTIVE);
    }

    // ========== CONVERSION ENTITY TO DTO ==========

    private PropertyDto convertToDto(PropertyEntity entity) {
        PropertyDto dto = new PropertyDto();
        BeanUtils.copyProperties(entity, dto, "characteristics", "images");

        dto.setUserId(entity.getOwnerId());
        dto.setStatus(entity.getStatus());

        // ✅ Convertir les images
        if (entity.getImages() != null && !entity.getImages().isEmpty()) {
            List<PropertyImageDto> imageDtos = entity.getImages().stream()
                    .map(this::convertImageToDto)
                    .collect(Collectors.toList());
            dto.setImages(imageDtos);

            // Définir l'URL de l'image principale
            PropertyImage mainImage = entity.getMainImage();
            if (mainImage != null) {
                dto.setMainImageUrl(mainImage.getImageUrl());
            }
        }

        // Convertir les caractéristiques
        if (entity.getCharacteristics() != null && !entity.getCharacteristics().isEmpty()) {
            List<CharacteristicDto> characteristicDtos = entity.getCharacteristics().stream()
                    .map(this::convertCharacteristicToDto)
                    .collect(Collectors.toList());
            dto.setCharacteristics(characteristicDtos);
        }

        return dto;
    }

    private PropertyImageDto convertImageToDto(PropertyImage image) {
        PropertyImageDto dto = new PropertyImageDto();
        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl());
        dto.setIsMain(image.getIsMain());
        dto.setDisplayOrder(image.getDisplayOrder());
        dto.setAltText(image.getAltText());
        dto.setCreatedAt(image.getCreatedAt());
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

    // ========== RABBITMQ EVENTS ==========

    private void publishPropertyCreatedEvent(PropertyEntity property) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("propertyId", property.getPropertyId());
            event.put("ownerId", property.getOwnerId());
            event.put("status", property.getStatus().name());
            event.put("timestamp", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PROPERTY_EXCHANGE,
                    RabbitMQConfig.PROPERTY_CREATED_ROUTING_KEY,
                    event
            );

            logger.info("✅ PropertyCreatedEvent published: propertyId={}, ownerId={}, status={}",
                    property.getPropertyId(), property.getOwnerId(), property.getStatus());
        } catch (Exception e) {
            logger.error("❌ Failed to publish PropertyCreatedEvent: {}", e.getMessage(), e);
        }
    }

    private void publishPropertyStatusChangedEvent(PropertyEntity property, String changedBy,
                                                   String action, String reason) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("propertyId", property.getPropertyId());
            event.put("ownerId", property.getOwnerId());
            event.put("newStatus", property.getStatus().name());
            event.put("action", action);
            event.put("changedBy", changedBy);
            event.put("reason", reason);
            event.put("timestamp", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PROPERTY_EXCHANGE,
                    "property.status.changed",
                    event
            );

            logger.info("✅ PropertyStatusChanged event published: {}", action);
        } catch (Exception e) {
            logger.error("❌ Failed to publish status change event: {}", e.getMessage(), e);
        }
    }

    // ========== MÉTHODES ADMIN (Suite de PropertyServiceImpl) ==========

    @Override
    public Page<PropertyDto> getPropertiesByStatus(PropertyStatus status, Pageable pageable) {
        Page<PropertyEntity> properties = propertyRepository.findByStatus(status, pageable);
        return properties.map(this::convertToDto);
    }

    @Override
    public Page<PropertyDto> getAllPropertiesIncludingDeleted(Pageable pageable) {
        Page<PropertyEntity> properties = propertyRepository.findAll(pageable);
        return properties.map(this::convertToDto);
    }

    @Override
    @Transactional
    public PropertyDto adminValidateProperty(String propertyId, String adminId, String comment) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (property.getStatus() != PropertyStatus.PENDING_VALIDATION) {
            throw new RuntimeException("Property must be in PENDING_VALIDATION status. Current: "
                    + property.getStatus());
        }

        property.setStatus(PropertyStatus.ACTIVE);
        PropertyEntity updated = propertyRepository.save(property);

        logger.info("✅ Property {} validated by admin {}", propertyId, adminId);

        publishPropertyStatusChangedEvent(updated, adminId, "VALIDATED", comment);

        return convertToDto(updated);
    }

    @Override
    @Transactional
    public PropertyDto adminRejectProperty(String propertyId, String adminId, String reason) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (property.getStatus() != PropertyStatus.PENDING_VALIDATION) {
            throw new RuntimeException("Only properties in PENDING_VALIDATION can be rejected");
        }

        property.setStatus(PropertyStatus.REJECTED);
        PropertyEntity updated = propertyRepository.save(property);

        logger.warn("❌ Property {} rejected by admin {}. Reason: {}", propertyId, adminId, reason);

        publishPropertyStatusChangedEvent(updated, adminId, "REJECTED", reason);

        return convertToDto(updated);
    }

    @Override
    @Transactional
    public PropertyDto adminSuspendProperty(String propertyId, String adminId, String reason) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        PropertyStatus previousStatus = property.getStatus();

        property.setStatus(PropertyStatus.SUSPENDED);
        PropertyEntity updated = propertyRepository.save(property);

        logger.warn("⚠️ Property {} suspended by admin {}. Previous status: {}. Reason: {}",
                propertyId, adminId, previousStatus, reason);

        publishPropertyStatusChangedEvent(updated, adminId, "SUSPENDED", reason);

        return convertToDto(updated);
    }

    @Override
    @Transactional
    public PropertyDto adminReactivateProperty(String propertyId, String adminId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        if (property.getStatus() != PropertyStatus.SUSPENDED) {
            throw new RuntimeException("Only SUSPENDED properties can be reactivated");
        }

        property.setStatus(PropertyStatus.ACTIVE);
        PropertyEntity updated = propertyRepository.save(property);

        logger.info("✅ Property {} reactivated by admin {}", propertyId, adminId);

        publishPropertyStatusChangedEvent(updated, adminId, "REACTIVATED", null);

        return convertToDto(updated);
    }

    @Override
    @Transactional
    public PropertyDto adminForceStatusChange(String propertyId, PropertyStatus newStatus,
                                              String adminId, String reason) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        PropertyStatus oldStatus = property.getStatus();

        property.setStatus(newStatus);
        PropertyEntity updated = propertyRepository.save(property);

        logger.warn("⚠️ ADMIN OVERRIDE: Property {} status forced from {} to {} by admin {}. Reason: {}",
                propertyId, oldStatus, newStatus, adminId, reason);

        publishPropertyStatusChangedEvent(updated, adminId, "FORCED_CHANGE", reason);

        return convertToDto(updated);
    }

    @Override
    public Map<String, Object> getPropertyStatistics() {
        Map<String, Object> stats = new HashMap<>();

        for (PropertyStatus status : PropertyStatus.values()) {
            Long count = propertyRepository.countByStatus(status);
            stats.put(status.name().toLowerCase(), count);
        }

        Long total = propertyRepository.count();
        stats.put("total", total);

        Long visible = propertyRepository.countByStatus(PropertyStatus.ACTIVE);
        stats.put("visible_to_public", visible);

        Long pending = propertyRepository.countByStatus(PropertyStatus.PENDING_VALIDATION);
        stats.put("awaiting_validation", pending);

        Long validated = propertyRepository.countByStatus(PropertyStatus.ACTIVE);
        Long rejected = propertyRepository.countByStatus(PropertyStatus.REJECTED);
        Long totalSubmitted = pending + validated + rejected;

        if (totalSubmitted > 0) {
            double validationRate = (validated * 100.0) / totalSubmitted;
            stats.put("validation_rate_percentage", Math.round(validationRate * 100.0) / 100.0);
        }

        return stats;
    }

    @Override
    public List<Map<String, Object>> getPropertyStatusHistory(String propertyId) {
        PropertyEntity property = propertyRepository.findByPropertyId(propertyId);
        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        List<Map<String, Object>> history = new ArrayList<>();

        Map<String, Object> currentState = new HashMap<>();
        currentState.put("status", property.getStatus());
        currentState.put("timestamp", property.getLastUpdateAt());
        currentState.put("note", "Current state (full history requires audit table)");

        history.add(currentState);

        return history;
    }
}