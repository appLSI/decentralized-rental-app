package ma.fstt.listingservice.dto;

import ma.fstt.listingservice.enums.PropertyStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PropertyDto {

    private Long id;
    private String propertyId;
    private String title;
    private String type;
    private String description;
    private String userId; // ownerId

    // Location
    private Double latitude;
    private Double longitude;
    private String addressName;
    private String city;
    private String country;
    private String state;
    private String codePostale;

    // Pricing
    private BigDecimal pricePerNight;

    // Capacity
    private Integer nbOfGuests;
    private Integer nbOfBedrooms;
    private Integer nbOfBeds;
    private Integer nbOfBathrooms;

    // ✅ NOUVEAU: Images structurées
    private List<PropertyImageDto> images = new ArrayList<>();
    private String mainImageUrl; // URL directe de l'image principale

    // Status
    private PropertyStatus status;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdateAt;

    // Characteristics
    private List<CharacteristicDto> characteristics = new ArrayList<>();

    // ========== CONSTRUCTORS ==========

    public PropertyDto() {
    }

    // ========== GETTERS ==========

    public Long getId() {
        return id;
    }

    public String getPropertyId() {
        return propertyId;
    }

    public String getTitle() {
        return title;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public String getUserId() {
        return userId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getAddressName() {
        return addressName;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public String getState() {
        return state;
    }

    public String getCodePostale() {
        return codePostale;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public Integer getNbOfGuests() {
        return nbOfGuests;
    }

    public Integer getNbOfBedrooms() {
        return nbOfBedrooms;
    }

    public Integer getNbOfBeds() {
        return nbOfBeds;
    }

    public Integer getNbOfBathrooms() {
        return nbOfBathrooms;
    }

    public List<PropertyImageDto> getImages() {
        return images;
    }

    public String getMainImageUrl() {
        return mainImageUrl;
    }

    public PropertyStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastUpdateAt() {
        return lastUpdateAt;
    }

    public List<CharacteristicDto> getCharacteristics() {
        return characteristics;
    }

    // ========== SETTERS ==========

    public void setId(Long id) {
        this.id = id;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setAddressName(String addressName) {
        this.addressName = addressName;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setCodePostale(String codePostale) {
        this.codePostale = codePostale;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public void setNbOfGuests(Integer nbOfGuests) {
        this.nbOfGuests = nbOfGuests;
    }

    public void setNbOfBedrooms(Integer nbOfBedrooms) {
        this.nbOfBedrooms = nbOfBedrooms;
    }

    public void setNbOfBeds(Integer nbOfBeds) {
        this.nbOfBeds = nbOfBeds;
    }

    public void setNbOfBathrooms(Integer nbOfBathrooms) {
        this.nbOfBathrooms = nbOfBathrooms;
    }

    public void setImages(List<PropertyImageDto> images) {
        this.images = images;
    }

    public void setMainImageUrl(String mainImageUrl) {
        this.mainImageUrl = mainImageUrl;
    }

    public void setStatus(PropertyStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setLastUpdateAt(LocalDateTime lastUpdateAt) {
        this.lastUpdateAt = lastUpdateAt;
    }

    public void setCharacteristics(List<CharacteristicDto> characteristics) {
        this.characteristics = characteristics;
    }
}