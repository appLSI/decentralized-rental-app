package ma.fstt.gateway.config;

import ma.fstt.gateway.filter.JwtAuthenticationFilter;
import ma.fstt.gateway.filter.RoleBasedAuthorizationFilter;
import ma.fstt.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    @Value("${listing.service.url}")
    private String listingServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // ==================== AUTH SERVICE ====================
                // ---------- Public Routes ----------
                .route("auth_signup", r -> r
                        .path("/api/auth/users")
                        .and().method("POST")
                        .filters(f -> f.stripPrefix(2))
                        .uri(authServiceUrl))
                .route("auth_login", r -> r
                        .path("/api/auth/users/login")
                        .and().method("POST")
                        .filters(f -> f.stripPrefix(2))
                        .uri(authServiceUrl))
                .route("auth_verify_otp", r -> r
                        .path("/api/auth/users/verify-otp")
                        .and().method("POST")
                        .filters(f -> f.stripPrefix(2))
                        .uri(authServiceUrl))
                .route("auth_resend_otp", r -> r
                        .path("/api/auth/users/resend-otp")
                        .and().method("POST")
                        .filters(f -> f.stripPrefix(2))
                        .uri(authServiceUrl))
                .route("auth_forgot_password", r -> r
                        .path("/api/auth/users/forgot-password")
                        .and().method("POST")
                        .filters(f -> f.stripPrefix(2))
                        .uri(authServiceUrl))
                .route("auth_reset_password", r -> r
                        .path("/api/auth/users/reset-password")
                        .and().method("POST")
                        .filters(f -> f.stripPrefix(2))
                        .uri(authServiceUrl))

                // ---------- Protected Routes ----------
                .route("auth_get_user", r -> r
                        .path("/api/auth/users/{id}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))
                .route("auth_update_user", r -> r
                        .path("/api/auth/users/{id}")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))
                .route("auth_update_wallet", r -> r
                        .path("/api/auth/users/{id}/wallet")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))
                .route("auth_delete_user", r -> r
                        .path("/api/auth/users/{id}")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(authServiceUrl))

                // ==================== WALLET MANAGEMENT ====================
                .route("wallet_connect", r -> r
                        .path("/api/auth/users/{userId}/wallet/connect")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))
                .route("wallet_disconnect", r -> r
                        .path("/api/auth/users/{userId}/wallet/disconnect")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))
                .route("wallet_can_disconnect", r -> r
                        .path("/api/auth/users/{userId}/wallet/can-disconnect")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))
                .route("wallet_status", r -> r
                        .path("/api/auth/users/{userId}/wallet/status")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))

                // ==================== LISTING SERVICE ====================

                // ---------- PROPERTIES - Public Routes ----------
                .route("listing_get_all_properties", r -> r
                        .path("/api/listings/properties")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))
                .route("listing_get_property", r -> r
                        .path("/api/listings/properties/{propertyId}")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))
                .route("listing_search_properties", r -> r
                        .path("/api/listings/properties/search")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))
                .route("listing_nearby_properties", r -> r
                        .path("/api/listings/properties/nearby")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))

                // ---------- PROPERTIES - Protected Routes ----------
                .route("listing_create_property", r -> r
                        .path("/api/listings/properties")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_update_property", r -> r
                        .path("/api/listings/properties/{propertyId}")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_update_property_status", r -> r
                        .path("/api/listings/properties/{propertyId}/status")
                        .and().method("PATCH")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_delete_property", r -> r
                        .path("/api/listings/properties/{propertyId}")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_my_properties", r -> r
                        .path("/api/listings/properties/my-properties")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_owner_properties", r -> r
                        .path("/api/listings/properties/owner/{ownerId}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_owner_property_count", r -> r
                        .path("/api/listings/properties/owner/{ownerId}/count")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                // ✅ NOUVEAU: Endpoint pour compter les properties actives
                .route("listing_owner_active_count", r -> r
                        .path("/api/listings/properties/owner/{ownerId}/active-count")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2)) // Public - Auth Service a besoin
                        .uri(listingServiceUrl))

                // ---------- PROPERTY IMAGES - Protected Routes ----------
                .route("listing_upload_images", r -> r
                        .path("/api/listings/properties/{propertyId}/images")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_delete_image", r -> r
                        .path("/api/listings/properties/{propertyId}/images")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // ---------- CHARACTERISTICS - Public GET ----------
                .route("listing_get_all_characteristics", r -> r
                        .path("/api/listings/characteristics")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))
                .route("listing_get_characteristic", r -> r
                        .path("/api/listings/characteristics/{id}")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))

                // ---------- CHARACTERISTICS - Admin Only (CUD) ----------
                .route("listing_create_characteristic", r -> r
                        .path("/api/listings/characteristics")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))
                .route("listing_update_characteristic", r -> r
                        .path("/api/listings/characteristics/{id}")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))
                .route("listing_delete_characteristic", r -> r
                        .path("/api/listings/characteristics/{id}")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))

                // ---------- TYPE CARACTERISTIQUES - Public GET ----------
                .route("listing_get_all_types", r -> r
                        .path("/api/listings/type-caracteristiques")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))
                .route("listing_get_type", r -> r
                        .path("/api/listings/type-caracteristiques/{id}")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))

                // ---------- TYPE CARACTERISTIQUES - Admin Only (CUD) ----------
                .route("listing_create_type", r -> r
                        .path("/api/listings/type-caracteristiques")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))
                .route("listing_update_type", r -> r
                        .path("/api/listings/type-caracteristiques/{id}")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))
                .route("listing_delete_type", r -> r
                        .path("/api/listings/type-caracteristiques/{id}")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))

                // ---------- OWNERS - Mixed Access ----------
                .route("listing_check_owner_status", r -> r
                        .path("/api/listings/owners/check/{userId}")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))
                .route("listing_get_owner", r -> r
                        .path("/api/listings/owners/{userId}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_get_all_owners", r -> r
                        .path("/api/listings/owners")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))

                .build();
    }
}