package ma.fstt.listingservice.entities;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "type_caracteristique")
public class TypeCharacteristique implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name; // WiFi, Piscine, Climatisation, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String iconPath; // Chemin vers l'icône

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIconPath() {
        return iconPath;
    }

    public void setIconPath(String iconPath) {
        this.iconPath = iconPath;
    }
}