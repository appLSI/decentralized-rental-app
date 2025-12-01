package com.example.authmicro_service1.exceptions;

// Exception for invalid credentials
public class InvalidCredentialsException extends UserServiceException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}