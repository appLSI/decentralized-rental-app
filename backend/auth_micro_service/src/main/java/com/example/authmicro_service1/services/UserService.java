package com.example.authmicro_service1.services;

import com.example.authmicro_service1.dto.UserDto;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {

    UserDto createUser(UserDto userDto);

    UserDto getUser(String email);

    UserDto getUserByUserId(String userId);

    UserDto updateUser(String id, UserDto userDto);

    void requestPasswordReset(String email);

    boolean resetPassword(String email, String code, String newPassword);

    // Admin methods
    UserDto createAgent(UserDto userDto, String adminUserId);

    List<UserDto> getAllAgents();

    void deleteAgent(String agentId, String adminUserId);

    // OTP methods
    boolean verifyOTP(String email, String code);

    void resendOTP(String email);

    void updateWalletAddress(String userId, String walletAddress);
}