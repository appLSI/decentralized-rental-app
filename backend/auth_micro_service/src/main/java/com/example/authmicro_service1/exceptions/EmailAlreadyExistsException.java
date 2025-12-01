package com.example.authmicro_service1.exceptions;

// Exception for email already exists
public class EmailAlreadyExistsException extends UserServiceException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}