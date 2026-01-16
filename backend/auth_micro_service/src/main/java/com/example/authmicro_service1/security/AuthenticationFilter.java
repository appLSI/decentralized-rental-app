package com.example.authmicro_service1.security;

import com.example.authmicro_service1.dto.UserDto;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;
import java.util.stream.Collectors;

public class AuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;

    public AuthenticationFilter(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res)
            throws AuthenticationException {
        try {
            UserLoginRequest creds = new ObjectMapper().readValue(req.getInputStream(), UserLoginRequest.class);
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            creds.getEmail(),
                            creds.getPassword(),
                            new ArrayList<>()
                    )
            );
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture des identifiants utilisateur", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest req,
                                            HttpServletResponse res,
                                            FilterChain chain,
                                            Authentication auth) throws IOException, ServletException {

        String userName = ((User) auth.getPrincipal()).getUsername();

        Key key = Keys.hmacShaKeyFor(SecurityConstants.TOKEN_SECRET.getBytes(StandardCharsets.UTF_8));

        // ✅ 1. Récupérer les détails complets de l'utilisateur
        UserService userService = (UserService) SpringApplicationContext.getBean("userServiceImpl");
        UserDto userDetails = userService.getUser(userName);

        // ✅ 2. Convertir les enums en String pour le JWT
        List<String> roleNames = userDetails.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        List<String> typeNames = userDetails.getTypes().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        // ✅ 3. Générer le Token JWT
        String token = Jwts.builder()
                .setSubject(userName)
                .claim("userId", userDetails.getUserId())
                .claim("roles", roleNames)
                .claim("types", typeNames)
                .setExpiration(new Date(System.currentTimeMillis() + SecurityConstants.EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        // ✅ 4. Ajouter le token dans les headers
        res.addHeader(SecurityConstants.HEADER_STRING, SecurityConstants.TOKEN_PREFIX + token);
        res.addHeader("user_id", userDetails.getUserId());

        // ✅ 5. NOUVEAU : Retourner l'objet utilisateur complet en JSON dans le body
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        // Retirer les mots de passe avant d'envoyer
        userDetails.setPassword(null);
        userDetails.setEncrypted_password(null);

        // Créer un objet de réponse complet
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", token);
        responseBody.put("user", userDetails);
        responseBody.put("message", "Connexion réussie");

        String jsonResponse = new ObjectMapper().writeValueAsString(responseBody);
        res.getWriter().write(jsonResponse);
        res.getWriter().flush();
    }

}
