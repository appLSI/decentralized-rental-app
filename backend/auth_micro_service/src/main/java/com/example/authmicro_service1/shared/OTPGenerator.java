package com.example.authmicro_service1.shared;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class OTPGenerator {

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Génère un code OTP à 6 chiffres
     * @return Code OTP sous forme de String
     */
    public String generateOTP() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Génère un identifiant utilisateur unique
     * @param length Longueur de l'identifiant
     * @return Identifiant unique
     */
    public String generateUserId(int length) {
        byte[] randomBytes = new byte[length];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes).substring(0, length);
    }
}