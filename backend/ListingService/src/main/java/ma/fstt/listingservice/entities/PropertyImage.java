package ma.fstt.listingservice.entities;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_images")
public class PropertyImage implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private PropertyEntity property;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ========== GETTERS ==========

    public Long getId() {
        return id;
    }

    public PropertyEntity getProperty() {
        return property;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Boolean getIsMain() {
        return isMain;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public String getAltText() {
        return altText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ========== SETTERS ==========

    public void setId(Long id) {
        this.id = id;
    }

    public void setProperty(PropertyEntity property) {
        this.property = property;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setIsMain(Boolean isMain) {
        this.isMain = isMain;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}