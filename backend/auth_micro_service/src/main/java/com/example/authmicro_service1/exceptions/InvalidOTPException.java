package com.example.authmicro_service1.exceptions;

// Exception for invalid OTP
public class InvalidOTPException extends UserServiceException {
    public InvalidOTPException(String message) {
        super(message);
    }
}