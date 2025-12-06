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

    // AJOUT : URLs des nouveaux services
    @Value("${booking.service.url}")
    private String bookingServiceUrl;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

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
                // Note: auth_update_wallet supprimé ici car géré dans WALLET MANAGEMENT plus bas
                .route("auth_delete_user", r -> r
                        .path("/api/auth/users/{id}")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(authServiceUrl))
                .route("auth_create_agent", r -> r
                        .path("/api/auth/users/admin/agents")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(authServiceUrl))
                .route("auth_get_all_agents", r -> r
                        .path("/api/auth/users/admin/agents")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(authServiceUrl))
                .route("auth_delete_agent", r -> r
                        .path("/api/auth/users/admin/agents/{agentId}")
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
                .route("listing_owner_active_count", r -> r
                        .path("/api/listings/properties/owner/{ownerId}/active-count")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))

                // ---------- ADMIN PROPERTIES (Missing in your code) ----------
                .route("listing_admin_pending_properties", r -> r
                        .path("/api/listings/admin/properties/pending")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))
                .route("listing_admin_validate_property", r -> r
                        .path("/api/listings/admin/properties/{propertyId}/validate")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))
                .route("listing_admin_reject_property", r -> r
                        .path("/api/listings/admin/properties/{propertyId}/reject")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))
                .route("listing_admin_force_status", r -> r
                        .path("/api/listings/admin/properties/{propertyId}/force-status")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))

                // ---------- PROPERTY STATUS SHORTCUTS ----------
                .route("listing_submit_property", r -> r
                        .path("/api/listings/properties/{propertyId}/submit")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_hide_property", r -> r
                        .path("/api/listings/properties/{propertyId}/hide")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_unhide_property", r -> r
                        .path("/api/listings/properties/{propertyId}/unhide")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // ---------- PROPERTY IMAGES ----------
                .route("listing_upload_images", r -> r
                        .path("/api/listings/properties/{propertyId}/images")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_set_main_image", r -> r
                        .path("/api/listings/properties/{propertyId}/images/{imageId}/set-main")
                        .and().method("PUT")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))
                .route("listing_delete_image", r -> r
                        .path("/api/listings/properties/{propertyId}/images/{imageId}")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // ---------- CHARACTERISTICS ----------
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

                // ---------- TYPE CARACTERISTIQUES ----------
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

                // ---------- OWNERS ----------
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

                // ==================== BOOKING SERVICE (NOUVEAU) ====================
                // Prefix: /api/bookings -> StripPrefix(1) -> /bookings
                .route("booking_create", r -> r
                        .path("/api/bookings")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))
                .route("booking_confirm_payment", r -> r
                        .path("/api/bookings/{bookingId}/confirm-payment")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))
                .route("booking_cancel", r -> r
                        .path("/api/bookings/{bookingId}/cancel")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))
                .route("booking_get_mine", r -> r
                        .path("/api/bookings/my-bookings")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))
                .route("booking_get_by_id", r -> r
                        .path("/api/bookings/{bookingId}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))

                // ==================== PAYMENT SERVICE (NOUVEAU) ====================
                // Prefix: /api/payments -> StripPrefix(1) -> /payments
                .route("payment_validate", r -> r
                        .path("/api/payments/validate")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(paymentServiceUrl))
                .route("payment_history_by_booking", r -> r
                        .path("/api/payments/booking/{bookingId}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(paymentServiceUrl))
                .route("payment_health", r -> r
                        .path("/api/payments/health")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(1))
                        .uri(paymentServiceUrl))

                .build();
    }
}