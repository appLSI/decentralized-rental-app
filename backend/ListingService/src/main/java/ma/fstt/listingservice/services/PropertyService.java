package ma.fstt.listingservice.services;


import ma.fstt.listingservice.dto.PropertyDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface PropertyService {

    PropertyDto createProperty(PropertyDto propertyDto, String ownerId);

    PropertyDto getPropertyByPropertyId(String propertyId);

    public List<PropertyDto> getPropertiesByUserId(String userId);


    Page<PropertyDto> getAllValidatedProperties(Pageable pageable);

    Page<PropertyDto> searchProperties(String city, String type, BigDecimal minPrice,
                                       BigDecimal maxPrice, Integer nbOfGuests, Pageable pageable);

    Page<PropertyDto> findPropertiesNearby(Double latitude, Double longitude,
                                           Double radius, Pageable pageable);

    PropertyDto updateProperty(String propertyId, PropertyDto propertyDto, String ownerId);

    PropertyDto updatePropertyStatus(String propertyId, Boolean isHidden, Boolean isDraft,
                                     Boolean isValidated, String ownerId);

    void deleteProperty(String propertyId, String ownerId);

    List<String> uploadPropertyImages(String propertyId, List<MultipartFile> images, String ownerId);

    void deletePropertyImage(String propertyId, String imagePath, String ownerId);


    Long countPropertiesByOwner(String ownerId);
}