package ma.fstt.listingservice.services.impl;
//saved
import ma.fstt.listingservice.dto.CharacteristicDto;
import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.entities.PropertyEntity;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyServiceImpl implements PropertyService {

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

    @Override
    @Transactional
    public PropertyDto createProperty(PropertyDto propertyDto, String userId) {
        // ✅ Récupérer l'Owner depuis la base de données
        Owner owner = ownerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with userId: " + userId + ". Please ensure user is synchronized from Auth Service."));

        // ✅ VÉRIFICATION: L'owner doit avoir une wallet address
        if (owner.getWalletAddress() == null || owner.getWalletAddress().trim().isEmpty()) {
            throw new RuntimeException("Cannot create property: Owner does not have a wallet address. Please add a wallet address in your profile first.");
        }

        PropertyEntity propertyEntity = new PropertyEntity();
        BeanUtils.copyProperties(propertyDto, propertyEntity, "characteristics", "owner");

        // Générer un propertyId unique
        propertyEntity.setPropertyId(propertyIdGenerator.generatePropertyId(20));
        propertyEntity.setOwner(owner);
        propertyEntity.setOwnerId(userId);

        // Initialiser les statuts
        if (propertyEntity.getIsDraft() == null) propertyEntity.setIsDraft(true);
        if (propertyEntity.getIsHidden() == null) propertyEntity.setIsHidden(false);
        if (propertyEntity.getIsDeleted() == null) propertyEntity.setIsDeleted(false);
        if (propertyEntity.getIsValidated() == null) propertyEntity.setIsValidated(false);

        // Sauvegarder la propriété
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

        return convertToDto(savedProperty);
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
        List<PropertyEntity> properties = propertyRepository.findByOwnerIdAndIsDeleted(userId, false);
        return properties.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PropertyDto> getAllValidatedProperties(Pageable pageable) {
        Page<PropertyEntity> properties = propertyRepository.findByIsValidatedAndIsDeleted(true, false, pageable);
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
    public PropertyDto updatePropertyStatus(String propertyId, Boolean isHidden, Boolean isDraft,
                                            Boolean isValidated, String userId) {
        PropertyEntity propertyEntity = propertyRepository.findByPropertyId(propertyId);

        if (propertyEntity == null) {
            throw new RuntimeException("Property not found");
        }

        if (!propertyEntity.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to modify this property");
        }

        if (isHidden != null) propertyEntity.setIsHidden(isHidden);
        if (isDraft != null) propertyEntity.setIsDraft(isDraft);
        if (isValidated != null) propertyEntity.setIsValidated(isValidated);

        PropertyEntity updatedProperty = propertyRepository.save(propertyEntity);
        return convertToDto(updatedProperty);
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

        propertyEntity.setIsDeleted(true);
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
        return propertyRepository.countByOwnerIdAndIsDeleted(userId, false);
    }

    // ✅ CORRECTION: Convert Entity to DTO avec mapping explicite de ownerId
    private PropertyDto convertToDto(PropertyEntity entity) {
        PropertyDto dto = new PropertyDto();
        BeanUtils.copyProperties(entity, dto, "characteristics");

        // ✅ FIX: Mapper explicitement l'ownerId depuis l'entité
        dto.setUserId(entity.getOwnerId());

        // Mapper les images
        if (entity.getImageFolderPath() != null) {
            dto.setImageFolderPath(entity.getImageFolderPath());
        }

        // Mapper les caractéristiques
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