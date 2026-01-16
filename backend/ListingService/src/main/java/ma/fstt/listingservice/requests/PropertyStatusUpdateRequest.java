package ma.fstt.listingservice.requests;

import ma.fstt.listingservice.entities.PropertyStatus;
import jakarta.validation.constraints.NotNull;

/**
 * DTO pour mettre à jour le status d'une property avec ENUM
 */
public class PropertyStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private PropertyStatus status;

    // Constructors
    public PropertyStatusUpdateRequest() {}

    public PropertyStatusUpdateRequest(PropertyStatus status) {
        this.status = status;
    }

    // Getter / Setter
    public PropertyStatus getStatus() {
        return status;
    }

    public void setStatus(PropertyStatus status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "PropertyStatusUpdateRequest{status=" + status + "}";
    }
}