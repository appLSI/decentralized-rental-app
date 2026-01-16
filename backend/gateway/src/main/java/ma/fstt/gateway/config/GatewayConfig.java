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

/**
 * ✅ Configuration complète du Gateway avec tous les endpoints
 * ✅ UPDATED: Added Host Dashboard routes
 *
 * Architecture:
 * - Auth Service (authentification, utilisateurs, wallets)
 * - Listing Service (propriétés, caractéristiques, owners)
 * - Booking Service (réservations, host dashboard)
 * - Payment Service (paiements blockchain)
 */
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

    @Value("${booking.service.url}")
    private String bookingServiceUrl;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // ==================== AUTH SERVICE ====================

                // ---------- Public Routes (Authentication) ----------
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

                // ---------- Protected User Management ----------
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

                .route("auth_delete_user", r -> r
                        .path("/api/auth/users/{id}")
                        .and().method("DELETE")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(authServiceUrl))

                // ---------- Agent Management (ADMIN Only) ----------
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

                // ---------- Wallet Management ----------
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

                .route("wallet_status", r -> r
                        .path("/api/auth/users/{userId}/wallet/status")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(authServiceUrl))

                // ==================== LISTING SERVICE ====================

                // ---------- Properties - Specific Routes (MUST come before generic routes) ----------

                // 1. My Properties (Specific)
                .route("listing_my_properties", r -> r
                        .path("/api/listings/properties/my-properties")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // 2. Search Properties (Specific)
                .route("listing_search_properties", r -> r
                        .path("/api/listings/properties/search")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))

                // 3. Nearby Properties (Specific)
                .route("listing_nearby_properties", r -> r
                        .path("/api/listings/properties/nearby")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))

                // 4. Pending Properties - ADMIN (Specific)
                .route("listing_pending_properties", r -> r
                        .path("/api/listings/properties/pending")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))

                // 5. Get Properties by Owner (Specific)
                .route("listing_get_properties_by_owner", r -> r
                        .path("/api/listings/properties/owner/{ownerId}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // ✅ NEW: Get Property IDs by Owner (for BookingService Host Dashboard)
                .route("listing_get_property_ids_by_owner", r -> r
                        .path("/api/listings/properties/owner/{ownerId}/property-ids")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // 6. Property Actions (Specific paths with actions)
                .route("listing_submit_property", r -> r
                        .path("/api/listings/properties/{propertyId}/submit")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                .route("listing_validate_property", r -> r
                        .path("/api/listings/properties/{propertyId}/validate")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))

                .route("listing_hide_property", r -> r
                        .path("/api/listings/properties/{propertyId}/hide")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                .route("listing_show_property", r -> r
                        .path("/api/listings/properties/{propertyId}/show")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                .route("listing_reject_property", r -> r
                        .path("/api/listings/properties/{propertyId}/reject")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter)
                                .filter(new RoleBasedAuthorizationFilter(jwtUtil, "ADMIN")))
                        .uri(listingServiceUrl))

                // 7. Property Images
                .route("listing_add_property_images", r -> r
                        .path("/api/listings/properties/{propertyId}/images")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // 8. Property Status Update
                .route("listing_update_property_status", r -> r
                        .path("/api/listings/properties/{propertyId}/status")
                        .and().method("PATCH")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                .route("listing_update_property_status_v2", r -> r
                        .path("/api/listings/properties/{propertyId}/status/v2")
                        .and().method("PATCH")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

                // ---------- Properties - Generic CRUD (MUST come after specific routes) ----------
                .route("listing_create_property", r -> r
                        .path("/api/listings/properties")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(jwtAuthenticationFilter))
                        .uri(listingServiceUrl))

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

                .route("listing_update_property", r -> r
                        .path("/api/listings/properties/{propertyId}")
                        .and().method("PUT")
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

                // ---------- Characteristics (Public + Admin) ----------
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

                // ---------- Type Caracteristiques (Public + Admin) ----------
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

                // ---------- Property Wallet Address (for Payment Service) ----------
                .route("listing_property_wallet", r -> r
                        .path("/api/listings/properties/{propertyId}/wallet-address")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(2))
                        .uri(listingServiceUrl))

                // ---------- Owners ----------
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

                // ==================== BOOKING SERVICE ====================

                // ---------- Booking Creation & Management ----------
                .route("booking_create", r -> r
                        .path("/api/bookings")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))

                .route("booking_cancel", r -> r
                        .path("/api/bookings/{bookingId}/cancel")
                        .and().method("PATCH")
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

                // ---------- Booking Counts ----------
                .route("booking_future_host_count", r -> r
                        .path("/api/bookings/host/{userId}/future-count")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))

                .route("booking_active_client_count", r -> r
                        .path("/api/bookings/client/{userId}/active-count")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))

                // ✅ NEW: Host Dashboard
                .route("booking_host_dashboard", r -> r
                        .path("/api/bookings/host")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))

                .route("booking_host_dashboard_by_id", r -> r
                        .path("/api/bookings/host/{hostId}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(bookingServiceUrl))

                // ==================== PAYMENT SERVICE ====================

                // ---------- Payment Validation ----------
                .route("payment_validate", r -> r
                        .path("/api/payments/validate")
                        .and().method("POST")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(paymentServiceUrl))

                // ---------- Payment History ----------
                .route("payment_history_by_booking", r -> r
                        .path("/api/payments/booking/{bookingId}")
                        .and().method("GET")
                        .filters(f -> f
                                .stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri(paymentServiceUrl))

                // ---------- Health Check ----------
                .route("payment_health", r -> r
                        .path("/api/payments/health")
                        .and().method("GET")
                        .filters(f -> f.stripPrefix(1))
                        .uri(paymentServiceUrl))

                .build();
    }
}