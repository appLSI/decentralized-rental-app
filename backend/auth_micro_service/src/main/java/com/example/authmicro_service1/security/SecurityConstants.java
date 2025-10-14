package com.example.authmicro_service1.security;

public class SecurityConstants {

    public static final long EXPIRATION_TIME  = 86400000 ;
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String SIGN_UP_URL = "/users";
    public static final String TOKEN_SECRET = "# In application.properties_token.secret=your-very-long-secret-key-that-is-at-least-64-characters-long-for-hs512-algorithm-security";
}
