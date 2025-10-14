package com.example.authmicro_service1.entities;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;

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



    @Column(nullable = false, length = 255)
    private String encrypted_password;

    @Column(length = 255)
    private String emailVerificationToken;

    @Column(nullable = true )
    private Boolean emailVerficationStatus = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserRole role; //

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
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

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public Boolean getEmailVerficationStatus() {
        return emailVerficationStatus;
    }

    public void setEmailVerficationStatus(Boolean emailVerficationStatus) {
        this.emailVerficationStatus = emailVerficationStatus;
    }




}
