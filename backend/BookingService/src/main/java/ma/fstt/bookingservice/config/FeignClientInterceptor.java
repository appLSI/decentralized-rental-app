package ma.fstt.bookingservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * ✅ Interceptor Feign pour propager les headers d'authentification
 * aux appels inter-services (BookingService → ListingService)
 *
 * Ce composant résout le problème 403 Forbidden en transmettant
 * automatiquement les headers Authorization et X-User-Id
 */
@Component
@Slf4j
public class FeignClientInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            // Propager le header Authorization (JWT Bearer Token)
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && !authHeader.isEmpty()) {
                template.header("Authorization", authHeader);
                log.debug("🔑 Propagating Authorization header to Feign client");
            }

            // Propager le header X-User-Id (si présent)
            String userIdHeader = request.getHeader("X-User-Id");
            if (userIdHeader != null && !userIdHeader.isEmpty()) {
                template.header("X-User-Id", userIdHeader);
                log.debug("👤 Propagating X-User-Id header: {}", userIdHeader);
            }

            // Log pour debugging
            log.debug("🔗 Feign call to: {}", template.url());
        } else {
            log.warn("⚠️ No RequestAttributes available - headers won't be propagated");
        }
    }
}