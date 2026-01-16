package ma.fstt.listingservice.events;

import java.io.Serializable;

public class UserCreatedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String walletAddress;

    // Constructeurs
    public UserCreatedEvent() {
    }

    public UserCreatedEvent(String userId, String email, String firstName, String lastName,
                            String phone, String walletAddress) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.walletAddress = walletAddress;
    }

    // Getters and Setters
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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", walletAddress='" + walletAddress + '\'' +
                '}';
    }
}