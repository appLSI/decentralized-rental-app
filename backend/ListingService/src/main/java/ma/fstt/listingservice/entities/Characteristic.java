package ma.fstt.listingservice.entities;


import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;

import java.util.*;
import java.util.*;

@Entity
@Table(name="Characteristic")
public class Characteristic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length=100 , nullable=false)
    private String name;

    @Column
    private String iconPath;


    @Column()
    private boolean isActive=true;


    @ManyToMany(mappedBy = "characteristics")
    @JsonBackReference
    private List<PropertyEntity> properties = new ArrayList<>();


    @ManyToOne
    @JoinColumn(name = "type_caracteristique_id", nullable = false)
    private TypeCharacteristique typeCaracteristique;


    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public List<PropertyEntity> getProperties() {
        return properties;
    }

    public void setProperties(List<PropertyEntity> properties) {
        this.properties = properties;
    }



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



    public TypeCharacteristique getTypeCaracteristique() {
        return typeCaracteristique;
    }

    public void setTypeCaracteristique(TypeCharacteristique typeCaracteristique) {
        this.typeCaracteristique = typeCaracteristique;
    }
}
