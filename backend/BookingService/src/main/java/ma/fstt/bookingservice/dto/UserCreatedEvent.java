package ma.fstt.bookingservice.dto;

import java.io.Serializable;

public class UserCreatedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;
    private String email;
    private String firstname;
    private String lastname;
    private String walletAddress;

    // Constructeurs
    public UserCreatedEvent() {}

    public UserCreatedEvent(String userId, String email, String firstname, String lastname, String walletAddress) {
        this.userId = userId;
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.walletAddress = walletAddress;
    }

    // Getters et Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getWalletAddress() {
        return walletAddress;
    }

    public void setWalletAddress(String walletAddress) {
        this.walletAddress = walletAddress;
    }

    @Override
    public String toString() {
        return "UserCreatedEvent{" +
                "userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", walletAddress='" + walletAddress + '\'' +
                '}';
    }
}