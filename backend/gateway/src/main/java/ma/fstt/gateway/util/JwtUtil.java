package ma.fstt.gateway.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    /**
     * Génère la clé de signature à partir du secret
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Extrait toutes les claims du token JWT
     * @throws JwtException si le token est invalide
     */
    public Claims getAllClaims(String token) throws JwtException {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            System.err.println("❌ Token expiré: " + e.getMessage());
            throw e;
        } catch (UnsupportedJwtException e) {
            System.err.println("❌ Token non supporté: " + e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            System.err.println("❌ Token malformé: " + e.getMessage());
            throw e;
        } catch (SignatureException e) {
            System.err.println("❌ Signature invalide: " + e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Token vide ou null: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Extrait le username (subject) du token
     */
    public String getUsernameFromToken(String token) {
        try {
            return getAllClaims(token).getSubject();
        } catch (JwtException e) {
            throw e;
        }
    }

    /**
     * Extrait l'userId du token
     */
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = getAllClaims(token);
            String userId = claims.get("userId", String.class);
            if (userId == null || userId.isEmpty()) {
                throw new IllegalArgumentException("UserId manquant dans le token");
            }
            return userId;
        } catch (JwtException e) {
            throw e;
        }
    }

    /**
     * Extrait les rôles du token
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        try {
            Claims claims = getAllClaims(token);
            Object rolesObj = claims.get("roles");
            if (rolesObj instanceof List) {
                return (List<String>) rolesObj;
            }
            System.out.println("⚠️ Aucun rôle trouvé dans le token");
            return List.of();
        } catch (JwtException e) {
            throw e;
        }
    }

    /**
     * Extrait les types du token
     */
    @SuppressWarnings("unchecked")
    public List<String> getTypesFromToken(String token) {
        try {
            Claims claims = getAllClaims(token);
            Object typesObj = claims.get("types");
            if (typesObj instanceof List) {
                return (List<String>) typesObj;
            }
            System.out.println("⚠️ Aucun type trouvé dans le token");
            return List.of();
        } catch (JwtException e) {
            throw e;
        }
    }

    /**
     * Vérifie si le token est expiré
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getAllClaims(token).getExpiration();
            boolean expired = expiration.before(new Date());
            if (expired) {
                System.err.println("❌ Token expiré depuis: " + expiration);
            }
            return expired;
        } catch (ExpiredJwtException e) {
            System.err.println("❌ Token déjà expiré: " + e.getMessage());
            return true;
        } catch (JwtException e) {
            throw e;
        }
    }

    /**
     * Valide le token JWT complètement
     * @return true si le token est valide, false sinon
     * @throws JwtException pour les erreurs spécifiques (expiré, malformé, etc.)
     */
    public boolean validateToken(String token) throws JwtException {
        try {
            // Tenter de parser le token (va lever une exception si invalide)
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);

            // Vérifier l'expiration
            if (isTokenExpired(token)) {
                return false;
            }

            System.out.println("✅ Token validé avec succès");
            return true;

        } catch (ExpiredJwtException e) {
            System.err.println("❌ Token expiré lors de la validation");
            throw e;
        } catch (UnsupportedJwtException e) {
            System.err.println("❌ Format de token non supporté");
            throw e;
        } catch (MalformedJwtException e) {
            System.err.println("❌ Token malformé");
            throw e;
        } catch (SignatureException e) {
            System.err.println("❌ Signature du token invalide");
            throw e;
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Token vide ou null");
            throw e;
        } catch (JwtException e) {
            System.err.println("❌ Erreur JWT: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    public boolean hasRole(String token, String role) {
        try {
            List<String> roles = getRolesFromToken(token);
            boolean hasRole = roles != null && roles.contains(role);
            if (!hasRole) {
                System.err.println("❌ Rôle requis '" + role + "' non trouvé. Rôles disponibles: " + roles);
            }
            return hasRole;
        } catch (JwtException e) {
            System.err.println("❌ Erreur lors de la vérification du rôle: " + e.getMessage());
            return false;
        }
    }

    /**
     * Vérifie si l'utilisateur a un type spécifique
     */
    public boolean hasType(String token, String type) {
        try {
            List<String> types = getTypesFromToken(token);
            boolean hasType = types != null && types.contains(type);
            if (!hasType) {
                System.err.println("❌ Type requis '" + type + "' non trouvé. Types disponibles: " + types);
            }
            return hasType;
        } catch (JwtException e) {
            System.err.println("❌ Erreur lors de la vérification du type: " + e.getMessage());
            return false;
        }
    }

    /**
     * Extrait les informations du token sans valider (utile pour le debugging)
     */
    public String getTokenInfo(String token) {
        try {
            Claims claims = getAllClaims(token);
            return "Token Info: " +
                    "\n- Subject: " + claims.getSubject() +
                    "\n- UserId: " + claims.get("userId") +
                    "\n- Roles: " + claims.get("roles") +
                    "\n- Types: " + claims.get("types") +
                    "\n- Expiration: " + claims.getExpiration() +
                    "\n- Issued At: " + claims.getIssuedAt();
        } catch (Exception e) {
            return "Impossible d'extraire les informations: " + e.getMessage();
        }
    }
}