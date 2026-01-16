package ma.fstt.listingservice.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
public class PropertyEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String propertyId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Relation avec Owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(name = "owner_user_id", nullable = false, length = 50)
    private String ownerId;

    // Location
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false, length = 200)
    private String addressName;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String codePostale;

    // Pricing
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    // Capacity
    @Column(nullable = false)
    private Integer nbOfGuests;

    @Column(nullable = false)
    private Integer nbOfBedrooms;

    @Column(nullable = false)
    private Integer nbOfBeds;

    @Column(nullable = false)
    private Integer nbOfBathrooms;

    // Images
    @ElementCollection
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image_path", length = 500)
    private List<String> imageFolderPath = new ArrayList<>();

    // ✅ NOUVEAU: UNIQUEMENT Status ENUM (pas de booléens !)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PropertyStatus status = PropertyStatus.DRAFT;

    // Timestamps
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime lastUpdateAt;

    @ManyToMany
    @JoinTable(
            name = "property_characteristic",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "characteristic_id")
    )
    @JsonManagedReference
    private List<Characteristic> characteristics = new ArrayList<>();

    // ========== HELPER METHODS ==========

    public void addCharacteristic(Characteristic characteristic) {
        this.characteristics.add(characteristic);
        characteristic.getProperties().add(this);
    }

    public void removeCharacteristic(Characteristic characteristic) {
        this.characteristics.remove(characteristic);
        characteristic.getProperties().remove(this);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdateAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdateAt = LocalDateTime.now();
    }

    // ========== BUSINESS LOGIC HELPERS ==========

    /**
     * Vérifier si property est visible publiquement
     */
    public boolean isPubliclyVisible() {
        return status.isPubliclyVisible();
    }

    /**
     * Vérifier si property peut accepter des bookings
     */
    public boolean canAcceptBookings() {
        return status.canAcceptBookings();
    }

    /**
     * Vérifier si property est éditable
     */
    public boolean isEditable() {
        return status.isEditable();
    }

    // ========== GETTERS AND SETTERS ==========

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Owner getOwner() {
        return owner;
    }

    public void setOwner(Owner owner) {
        this.owner = owner;
        if (owner != null) {
            this.ownerId = owner.getUserId();
        }
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
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

    public List<Characteristic> getCharacteristics() {
        return characteristics;
    }

    public void setCharacteristics(List<Characteristic> characteristics) {
        this.characteristics = characteristics;
    }
}