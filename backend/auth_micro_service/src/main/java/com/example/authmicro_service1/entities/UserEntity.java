package com.example.authmicro_service1.entities;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity(name="users")
public class UserEntity implements Serializable {

    private static final long serialVersionUID = -1234567890123456789L;

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String userId;

    @Column(nullable = false, length = 50)
    private String firstname;

    @Column(nullable = false, length = 50)
    private String lastname;

    @Column(nullable = false, length = 120, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 60)
    private String country;

    @Column(length = 60)
    private String city;

    @Column(length = 60)
    private String state;
    private LocalDate date_of_birth;

    @Column(length = 255)
    private String address;

    @Column(length = 255)
    private String profile_image;

    @Column(length = 42, unique = true)
    private String walletAddress;



    // ✅ Code OTP à 6 chiffres
    @Column(length = 6)
    private String verificationCode;

    // ✅ Date d'expiration du code OTP
    @Column
    private LocalDateTime verificationCodeExpiresAt;



    @Column(nullable = false, length = 255)
    private String encrypted_password;



    @Column(nullable = true )
    private Boolean emailVerficationStatus = false;

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

    // ✅ Global roles (ADMIN, AGENT, USER)
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<UserRole> roles = new HashSet<>();

    // ✅ User types (HOST, CLIENT)
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_types", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "type")
    private Set<UserType> types = new HashSet<>(Set.of(UserType.CLIENT));


    // Dans UserEntity.java

    // Code OTP pour réinitialisation de mot de passe
    @Column(length = 6)
    private String passwordResetCode;

    // Date d'expiration du code de réinitialisation
    @Column
    private LocalDateTime passwordResetCodeExpiresAt;

    // Getters et Setters
    public String getPasswordResetCode() {
        return passwordResetCode;
    }

    public void setPasswordResetCode(String passwordResetCode) {
        this.passwordResetCode = passwordResetCode;
    }

    public LocalDateTime getPasswordResetCodeExpiresAt() {
        return passwordResetCodeExpiresAt;
    }

    public void setPasswordResetCodeExpiresAt(LocalDateTime passwordResetCodeExpiresAt) {
        this.passwordResetCodeExpiresAt = passwordResetCodeExpiresAt;
    }





    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public LocalDate getDate_of_birth() {
        return date_of_birth;
    }

    public void setDate_of_birth(LocalDate date_of_birth) {
        this.date_of_birth = date_of_birth;
    }

    public String getAddress() {
        return address;
    }

    public String getWalletAddress() {
        return walletAddress;
    }

    public void setWalletAddress(String walletAddress) {
        this.walletAddress = walletAddress;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProfile_image() {
        return profile_image;
    }

    public void setProfile_image(String profile_image) {
        this.profile_image = profile_image;
    }

    public String getEncrypted_password() {
        return encrypted_password;
    }

    public void setEncrypted_password(String encrypted_password) {
        this.encrypted_password = encrypted_password;
    }


    public Boolean getEmailVerficationStatus() {
        return emailVerficationStatus;
    }

    public void setEmailVerficationStatus(Boolean emailVerficationStatus) {
        this.emailVerficationStatus = emailVerficationStatus;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public LocalDateTime getVerificationCodeExpiresAt() {
        return verificationCodeExpiresAt;
    }

    public void setVerificationCodeExpiresAt(LocalDateTime verificationCodeExpiresAt) {
        this.verificationCodeExpiresAt = verificationCodeExpiresAt;
    }


}
