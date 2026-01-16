package com.example.authmicro_service1.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebSecurity {

    private final UserDetailsService userService;
    private final PasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationConfiguration authenticationConfiguration;

    public WebSecurity(UserDetailsService userService,
                       PasswordEncoder bCryptPasswordEncoder,
                       AuthenticationConfiguration authenticationConfiguration) {
        this.userService = userService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.authenticationConfiguration = authenticationConfiguration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        AuthenticationManager authenticationManager = authenticationConfiguration.getAuthenticationManager();
        AuthenticationFilter authenticationFilter = getAuthenticationFilter(authenticationManager);
        AuthorizationFilter authorizationFilter = new AuthorizationFilter(authenticationManager);

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // ✅ Endpoints publics (pas d'authentification requise)
                        .requestMatchers(HttpMethod.POST, SecurityConstants.SIGN_UP_URL).permitAll()
                        .requestMatchers("/users").permitAll()
                        .requestMatchers(HttpMethod.POST, "/users/login").permitAll()
                        .requestMatchers("/users/verify-otp", "/users/resend-otp",
                                "/users/forgot-password", "/users/reset-password").permitAll()
                        .requestMatchers("/error").permitAll()

                        // ✅ NOUVEAUX ENDPOINTS WALLET - Authentification requise
                        .requestMatchers(HttpMethod.POST, "/users/*/wallet/connect").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/users/*/wallet/disconnect").authenticated()

                        // ✅ Endpoint wallet/status - Accessible par d'autres services (via API Gateway)
                        // En production, à sécuriser avec un API key ou JWT service-to-service
                        .requestMatchers(HttpMethod.GET, "/users/*/wallet/status").permitAll()

                        // Tous les autres endpoints nécessitent une authentification
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilter(authenticationFilter)
                .addFilterBefore(authorizationFilter, AuthenticationFilter.class);

        return http.build();
    }

    private AuthenticationFilter getAuthenticationFilter(AuthenticationManager authenticationManager) {
        AuthenticationFilter filter = new AuthenticationFilter(authenticationManager);
        filter.setFilterProcessesUrl("/users/login");
        return filter;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(bCryptPasswordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}