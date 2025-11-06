package com.example.authmicro_service1.dto;

import com.example.authmicro_service1.entities.UserRole;
import com.example.authmicro_service1.entities.UserType;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class UserDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String userId;
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String country;
    private String city;
    private String state;
    private LocalDate date_of_birth;
    private String address;
    private String profile_image;
    private String password;
    private String encrypted_password;
    private Boolean emailVerficationStatus;

    // Nouveaux champs
    private Set<UserRole> roles;  // ✅ Enum UserRole
    private Set<UserType> types;
    public Set<UserType> getTypes() {
        return types;
    }

    public void setTypes(Set<UserType> types) {
        this.types = types;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }

    // Getters et Setters existants
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public LocalDate getDate_of_birth() { return date_of_birth; }
    public void setDate_of_birth(LocalDate date_of_birth) { this.date_of_birth = date_of_birth; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getProfile_image() { return profile_image; }
    public void setProfile_image(String profile_image) { this.profile_image = profile_image; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEncrypted_password() { return encrypted_password; }
    public void setEncrypted_password(String encrypted_password) { this.encrypted_password = encrypted_password; }

    public Boolean getEmailVerficationStatus() { return emailVerficationStatus; }
    public void setEmailVerficationStatus(Boolean emailVerficationStatus) { this.emailVerficationStatus = emailVerficationStatus; }

}
