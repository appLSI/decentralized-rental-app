package com.example.authmicro_service1.exceptions;

// Base exception for user-related errors
public class UserServiceException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public UserServiceException(String message) {
    super(message);
  }
}