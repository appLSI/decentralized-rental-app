package com.example.authmicro_service1.exceptions;

// Exception for expired OTP
public class ExpiredOTPException extends UserServiceException {
    public ExpiredOTPException(String message) {
        super(message);
    }
}