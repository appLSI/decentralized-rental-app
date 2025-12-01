package com.example.authmicro_service1.exceptions;

// Exception for wallet address errors
public class WalletAddressException extends UserServiceException {
    public WalletAddressException(String message) {
        super(message);
    }
}