package ma.fstt.listingservice.dto;

import ma.fstt.listingservice.entities.PropertyStatus;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PropertyDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String propertyId;
    private String userId; // OwnerId
    private String title;
    private String type;

    private String description;

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

    // ✅ NOUVEAU: Status ENUM (UNIQUEMENT)
    private PropertyStatus status;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdateAt;

    // Characteristics
    private List<CharacteristicDto> characteristics = new ArrayList<>();

    // ========== MÉTHODES HELPER (BUSINESS LOGIC) ==========

    /**
     * Vérifier si property est réservable
     */
    public boolean isReservable() {
        return status == PropertyStatus.ACTIVE;
    }

    /**
     * Vérifier si property est visible (pour owner)
     */
    public boolean isVisible() {
        return status == PropertyStatus.ACTIVE || status == PropertyStatus.HIDDEN;
    }

    /**
     * Vérifier si property peut être éditée
     */
    public boolean canBeEdited() {
        return status == PropertyStatus.DRAFT || status == PropertyStatus.PENDING;
    }

    /**
     * Vérifier si property est en attente de validation
     */
    public boolean isPending() {
        return status == PropertyStatus.PENDING;
    }

    /**
     * Vérifier si property est supprimée
     */
    public boolean isDeleted() {
        return status == PropertyStatus.DELETED;
    }

    // ========== GETTERS ET SETTERS ==========

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

    public PropertyStatus getStatus() {
        return status;
    }

    public void setStatus(PropertyStatus status) {
        this.status = status;
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


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}