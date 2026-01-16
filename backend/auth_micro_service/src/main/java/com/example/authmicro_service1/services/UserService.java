package com.example.authmicro_service1.services;

import com.example.authmicro_service1.dto.UserDto;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {

    UserDto createUser(UserDto userDto);

    UserDto getUser(String email);

    UserDto getUserByUserId(String userId);

    UserDto updateUser(String id , UserDto userDto);

    void requestPasswordReset(String email);
    boolean resetPassword(String email, String code, String newPassword);
}
