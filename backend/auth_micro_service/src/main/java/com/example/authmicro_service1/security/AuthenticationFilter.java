package com.example.authmicro_service1.security;

import com.example.authmicro_service1.dto.ErrorResponse;
import com.example.authmicro_service1.dto.UserDto;
import com.example.authmicro_service1.exceptions.EmailNotVerifiedException;
import com.example.authmicro_service1.exceptions.UserNotFoundException;
import com.example.authmicro_service1.requests.UserLoginRequest;
import com.example.authmicro_service1.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class AuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;

    public AuthenticationFilter(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res)
            throws AuthenticationException {

        // ✅ CORRECTIF CORS : Si c'est une requête OPTIONS, on répond OK (200) et on arrête là.
        // Cela permet au navigateur de recevoir la validation CORS sans erreur.
        if (req.getMethod().equals("OPTIONS")) {
            res.setStatus(HttpServletResponse.SC_OK);
            return null; // Retourner null arrête le filtre proprement sans erreur
        }

        // ✅ Vérification méthode POST (pour éviter le crash Jackson sur les autres méthodes)
        if (!req.getMethod().equals("POST")) {
            throw new AuthenticationServiceException("Authentication method not supported: " + req.getMethod());
        }

        try {
            UserLoginRequest creds = new ObjectMapper().readValue(req.getInputStream(), UserLoginRequest.class);
            // ... reste du code (vérification email/password)

            if (creds.getEmail() == null || creds.getEmail().trim().isEmpty()) {
                throw new BadCredentialsException("L'email est requis");
            }

            if (creds.getPassword() == null || creds.getPassword().trim().isEmpty()) {
                throw new BadCredentialsException("Le mot de passe est requis");
            }

            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            creds.getEmail(),
                            creds.getPassword(),
                            new ArrayList<>()
                    )
            );
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture des identifiants", e);
        }
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              AuthenticationException failed) throws IOException, ServletException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(LocalDateTime.now());
        errorResponse.setPath(request.getRequestURI());

        // Check the cause of the authentication exception
        Throwable cause = failed.getCause();
        String message = failed.getMessage();

        if (cause instanceof UserNotFoundException || message.contains("Aucun compte n'existe") || message.contains("Aucun utilisateur")) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            errorResponse.setStatus(HttpServletResponse.SC_NOT_FOUND);
            errorResponse.setError("User Not Found");
            errorResponse.setMessage(message != null ? message : "Utilisateur non trouvé");
        } else if (cause instanceof EmailNotVerifiedException || message.contains("vérifier votre email")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            errorResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
            errorResponse.setError("Email Not Verified");
            errorResponse.setMessage(message != null ? message : "Veuillez vérifier votre email avant de vous connecter");
        } else if (failed instanceof BadCredentialsException) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            errorResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            errorResponse.setError("Invalid Credentials");
            errorResponse.setMessage("Email ou mot de passe incorrect");
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            errorResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            errorResponse.setError("Authentication Failed");
            errorResponse.setMessage(message != null ? message : "Échec de l'authentification");
        }

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest req,
                                            HttpServletResponse res,
                                            FilterChain chain,
                                            Authentication auth) throws IOException, ServletException {

        String userName = ((User) auth.getPrincipal()).getUsername();

        Key key = Keys.hmacShaKeyFor(SecurityConstants.TOKEN_SECRET.getBytes(StandardCharsets.UTF_8));

        UserService userService = (UserService) SpringApplicationContext.getBean("userServiceImpl");
        UserDto userDto = userService.getUser(userName);

        List<String> roleNames = userDto.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        List<String> typeNames = userDto.getTypes().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        String token = Jwts.builder()
                .setSubject(userName)
                .claim("userId", userDto.getUserId())
                .claim("roles", roleNames)
                .claim("types", typeNames)
                .setExpiration(new Date(System.currentTimeMillis() + SecurityConstants.EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        res.addHeader(SecurityConstants.HEADER_STRING, SecurityConstants.TOKEN_PREFIX + token);
        res.addHeader("user_id", userDto.getUserId());

        // Optionally return a JSON response body with user info
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        String jsonResponse = String.format(
                "{\"message\":\"Connexion réussie\",\"userId\":\"%s\",\"token\":\"%s\"}",
                userDto.getUserId(),
                SecurityConstants.TOKEN_PREFIX + token
        );
        res.getWriter().write(jsonResponse);
    }
}