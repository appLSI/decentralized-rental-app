package com.example.authmicro_service1.exceptions;

// Exception for when user is not found
public class UserNotFoundException extends UserServiceException {
    public UserNotFoundException(String message) {
        super(message);
    }
}