package com.example.authmicro_service1.exceptions;

// Exception for invalid password
public class InvalidPasswordException extends UserServiceException {
    public InvalidPasswordException(String message) {
        super(message);
    }
}