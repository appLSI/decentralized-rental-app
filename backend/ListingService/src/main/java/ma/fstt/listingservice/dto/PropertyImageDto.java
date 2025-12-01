package ma.fstt.listingservice.dto;

import java.time.LocalDateTime;

public class PropertyImageDto {

    private Long id;
    private String imageUrl;
    private Boolean isMain;
    private Integer displayOrder;
    private String altText;
    private LocalDateTime createdAt;

    // ========== CONSTRUCTORS ==========

    public PropertyImageDto() {
    }

    public PropertyImageDto(Long id, String imageUrl, Boolean isMain, Integer displayOrder, String altText) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.isMain = isMain;
        this.displayOrder = displayOrder;
        this.altText = altText;
    }

    // ========== GETTERS ==========

    public Long getId() {
        return id;
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