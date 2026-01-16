// BookingServiceClient.java

package ma.fstt.paymentservice.clients;


import ma.fstt.paymentservice.dto.BookingDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "booking-service", url = "${booking.service.url:http://booking-service:8083}")
public interface BookingServiceClient {

    @GetMapping("/bookings/{bookingId}")
    BookingDTO getBooking(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Id") String userId
    );
}