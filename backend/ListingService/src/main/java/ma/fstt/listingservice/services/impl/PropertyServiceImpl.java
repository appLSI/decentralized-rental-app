package ma.fstt.listingservice.services.impl;

import ma.fstt.listingservice.dto.CharacteristicDto;
import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.entities.PropertyEntity;
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

    @Override
    @Transactional
    public PropertyDto createProperty(PropertyDto propertyDto, String userId) {
        Owner owner = ownerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with userId: " + userId + ". Please ensure user is synchronized from Auth Service."));

        if (owner.getWalletAddress() == null || owner.getWalletAddress().trim().isEmpty()) {
            throw new RuntimeException("Cannot create property: Owner does not have a wallet address. Please add a wallet address in your profile first.");
        }

        PropertyEntity propertyEntity = new PropertyEntity();
        BeanUtils.copyProperties(propertyDto, propertyEntity, "characteristics", "owner", "status");

        propertyEntity.setPropertyId(propertyIdGenerator.generatePropertyId(20));
        propertyEntity.setOwner(owner);
        propertyEntity.setOwnerId(userId);

        // ✅ NOUVEAU: Initialiser le status avec l'enum
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

        // Vérifier que la propriété est modifiable
        if (!propertyEntity.isEditable()) {
            throw new RuntimeException("Property cannot be edited in current status: " + propertyEntity.getStatus());
        }

        // Mettre à jour les champs de base
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
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        // Validation des transitions de status
        validateStatusTransition(propertyEntity.getStatus(), newStatus);

        propertyEntity.setStatus(newStatus);

        PropertyEntity updatedProperty = propertyRepository.save(propertyEntity);
        return convertToDto(updatedProperty);
    }

    /**
     * Valide que la transition de status est autorisée
     */
    private void validateStatusTransition(PropertyStatus currentStatus, PropertyStatus newStatus) {
        // Définir les transitions autorisées
        boolean isValid = switch (currentStatus) {
            case DRAFT -> newStatus == PropertyStatus.PENDING_VALIDATION ||
                    newStatus == PropertyStatus.DELETED;
            case PENDING_VALIDATION -> newStatus == PropertyStatus.ACTIVE ||
                    newStatus == PropertyStatus.REJECTED ||
                    newStatus == PropertyStatus.DRAFT ||
                    newStatus == PropertyStatus.DELETED;
            case ACTIVE -> newStatus == PropertyStatus.HIDDEN ||
                    newStatus == PropertyStatus.INACTIVE ||
                    newStatus == PropertyStatus.DELETED;
            case HIDDEN -> newStatus == PropertyStatus.ACTIVE ||
                    newStatus == PropertyStatus.INACTIVE ||
                    newStatus == PropertyStatus.DELETED;
            case REJECTED -> newStatus == PropertyStatus.DRAFT ||
                    newStatus == PropertyStatus.DELETED;
            case INACTIVE -> newStatus == PropertyStatus.ACTIVE ||
                    newStatus == PropertyStatus.DELETED;
            case DELETED -> false; // Pas de retour depuis DELETED
        };

        if (!isValid) {
            throw new RuntimeException(
                    String.format("Invalid status transition from %s to %s", currentStatus, newStatus)
            );
        }
    }

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

    // ✅ Conversion Entity to DTO
    private PropertyDto convertToDto(PropertyEntity entity) {
        PropertyDto dto = new PropertyDto();
        BeanUtils.copyProperties(entity, dto, "characteristics");

        dto.setUserId(entity.getOwnerId());
        dto.setStatus(entity.getStatus());

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
}