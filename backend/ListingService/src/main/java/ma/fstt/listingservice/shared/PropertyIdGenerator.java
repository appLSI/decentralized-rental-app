package ma.fstt.listingservice.shared;



import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Random;

@Component
public class PropertyIdGenerator {

    private final Random random = new SecureRandom();
    private final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    /**
     * Génère un identifiant unique pour une propriété
     * @param length Longueur de l'identifiant
     * @return Identifiant unique
     */
    public String generatePropertyId(int length) {
        StringBuilder returnValue = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            returnValue.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return returnValue.toString();
    }
}