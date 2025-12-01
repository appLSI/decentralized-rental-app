package com.example.authmicro_service1.exceptions;

// Exception for unverified email
public class EmailNotVerifiedException extends UserServiceException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
