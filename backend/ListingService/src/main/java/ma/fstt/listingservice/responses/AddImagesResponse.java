package ma.fstt.listingservice.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ✅ Réponse pour l'ajout d'images à une propriété
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddImagesResponse {
    private String message;
    private String propertyId;
    private List<String> addedImages;
    private List<String> allImages;
    private Integer totalImages;
}