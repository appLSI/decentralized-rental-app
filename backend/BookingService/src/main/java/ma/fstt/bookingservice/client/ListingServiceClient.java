package ma.fstt.bookingservice.client;

import ma.fstt.bookingservice.response.PropertyDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(
        name = "listing-service",
        url = "${external.services.listing.url}"
)
public interface ListingServiceClient {

    @GetMapping("/properties/{id}")
    PropertyDTO getProperty(@PathVariable("id") String id); // Changé Long -> String


    @GetMapping("/properties/owner/{ownerId}/property-ids")
    List<String> getPropertyIdsByOwner(@PathVariable("ownerId") String ownerId);
}