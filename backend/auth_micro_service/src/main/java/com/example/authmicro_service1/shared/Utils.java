package com.example.authmicro_service1.shared;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Random;

@Component
public class Utils {

    private final Random random = new SecureRandom();

    private final String ALPHAPET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmopqrstuvwxyz";

    public String generateUserId(int length) {
        StringBuilder returnValue = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            returnValue.append(ALPHAPET.charAt(random.nextInt(ALPHAPET.length())));
        }
        return new String(returnValue);
    }
}
