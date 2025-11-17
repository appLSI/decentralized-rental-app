package ma.fstt.listingservice.dto;

import java.io.Serializable;

public class CharacteristicDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String iconPath;
    private Boolean isActive;
    private Long typeCaracteristiqueId;
    private String typeCaracteristiqueName; // Pour faciliter l'affichage

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIconPath() {
        return iconPath;
    }

    public void setIconPath(String iconPath) {
        this.iconPath = iconPath;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Long getTypeCaracteristiqueId() {
        return typeCaracteristiqueId;
    }

    public void setTypeCaracteristiqueId(Long typeCaracteristiqueId) {
        this.typeCaracteristiqueId = typeCaracteristiqueId;
    }

    public String getTypeCaracteristiqueName() {
        return typeCaracteristiqueName;
    }

    public void setTypeCaracteristiqueName(String typeCaracteristiqueName) {
        this.typeCaracteristiqueName = typeCaracteristiqueName;
    }
}