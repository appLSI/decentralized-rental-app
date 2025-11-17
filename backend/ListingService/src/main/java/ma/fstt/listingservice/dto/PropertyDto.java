package ma.fstt.listingservice.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PropertyDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String propertyId;
    private String userId;
    private String title;
    private String type;

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

    // Images
    private List<String> imageFolderPath = new ArrayList<>();

    // Status
    private Boolean isHidden;
    private Boolean isDraft;
    private Boolean isDeleted;
    private Boolean isValidated;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdateAt;

    // Characteristics (One-to-Many)
    private List<CharacteristicDto> characteristics = new ArrayList<>();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddressName() {
        return addressName;
    }

    public void setAddressName(String addressName) {
        this.addressName = addressName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCodePostale() {
        return codePostale;
    }

    public void setCodePostale(String codePostale) {
        this.codePostale = codePostale;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getNbOfGuests() {
        return nbOfGuests;
    }

    public void setNbOfGuests(Integer nbOfGuests) {
        this.nbOfGuests = nbOfGuests;
    }

    public Integer getNbOfBedrooms() {
        return nbOfBedrooms;
    }

    public void setNbOfBedrooms(Integer nbOfBedrooms) {
        this.nbOfBedrooms = nbOfBedrooms;
    }

    public Integer getNbOfBeds() {
        return nbOfBeds;
    }

    public void setNbOfBeds(Integer nbOfBeds) {
        this.nbOfBeds = nbOfBeds;
    }

    public Integer getNbOfBathrooms() {
        return nbOfBathrooms;
    }

    public void setNbOfBathrooms(Integer nbOfBathrooms) {
        this.nbOfBathrooms = nbOfBathrooms;
    }

    public List<String> getImageFolderPath() {
        return imageFolderPath;
    }

    public void setImageFolderPath(List<String> imageFolderPath) {
        this.imageFolderPath = imageFolderPath;
    }

    public Boolean getIsHidden() {
        return isHidden;
    }

    public void setIsHidden(Boolean isHidden) {
        this.isHidden = isHidden;
    }

    public Boolean getIsDraft() {
        return isDraft;
    }

    public void setIsDraft(Boolean isDraft) {
        this.isDraft = isDraft;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Boolean getIsValidated() {
        return isValidated;
    }

    public void setIsValidated(Boolean isValidated) {
        this.isValidated = isValidated;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastUpdateAt() {
        return lastUpdateAt;
    }

    public void setLastUpdateAt(LocalDateTime lastUpdateAt) {
        this.lastUpdateAt = lastUpdateAt;
    }

    public List<CharacteristicDto> getCharacteristics() {
        return characteristics;
    }

    public void setCharacteristics(List<CharacteristicDto> characteristics) {
        this.characteristics = characteristics;
    }
}