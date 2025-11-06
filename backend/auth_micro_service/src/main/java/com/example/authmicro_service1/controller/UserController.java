package com.example.authmicro_service1.controller;

import com.example.authmicro_service1.dto.UserDto;
import com.example.authmicro_service1.requests.UserRequest;
import com.example.authmicro_service1.requests.VerifyOTPRequest;
import com.example.authmicro_service1.responses.UserResponse;
import com.example.authmicro_service1.services.impl.userServiceImpl;
import com.example.authmicro_service1.requests.ForgotPasswordRequest;
import com.example.authmicro_service1.requests.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;


import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    userServiceImpl userService;

    /**
     * Récupérer un utilisateur par son ID
     */
    @GetMapping(path="/{id}")
    public UserResponse getUser(@PathVariable String id) {
        UserDto userDto = userService.getUserByUserId(id);
        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(userDto, userResponse);
        return userResponse;
    }

    /**
     * Créer un nouvel utilisateur (envoie un code OTP par email)
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> addUser(@RequestBody UserRequest userRequest) {
        try {
            UserDto userDto = new UserDto();
            BeanUtils.copyProperties(userRequest, userDto);

            UserDto createdUser = userService.createUser(userDto);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Utilisateur créé avec succès. Un code de vérification a été envoyé à votre email.");
            response.put("userId", createdUser.getUserId());
            response.put("email", createdUser.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Vérifier le code OTP
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOTP(@RequestBody VerifyOTPRequest request) {
        try {
            boolean isVerified = userService.verifyOTP(request.getEmail(), request.getCode());

            Map<String, String> response = new HashMap<>();
            if (isVerified) {
                response.put("message", "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Code de vérification incorrect.");
                response.put("status", "error");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Renvoyer un code OTP
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOTP(@RequestParam("email") String email) {
        try {
            userService.resendOTP(email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Un nouveau code de vérification a été envoyé à votre email.");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Mettre à jour un utilisateur
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserRequest userRequest) {
        try {
            UserDto userDto = new UserDto();
            BeanUtils.copyProperties(userRequest, userDto);

            UserDto updatedUser = userService.updateUser(id, userDto);

            UserResponse userResponse = new UserResponse();
            BeanUtils.copyProperties(updatedUser, userResponse);
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Supprimer un utilisateur
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Delete user with ID: " + id);
        return ResponseEntity.ok(response);
    }





    /**
     * Demander la réinitialisation du mot de passe
     * POST /users/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            userService.requestPasswordReset(request.getEmail());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Un code de réinitialisation a été envoyé à votre email.");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Une erreur est survenue: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Réinitialiser le mot de passe avec le code OTP
     * POST /users/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            boolean isReset = userService.resetPassword(
                    request.getEmail(),
                    request.getCode(),
                    request.getNewPassword()
            );

            Map<String, String> response = new HashMap<>();
            if (isReset) {
                response.put("message", "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.");
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Code de réinitialisation incorrect.");
                response.put("status", "error");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Une erreur est survenue: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PutMapping("/{id}/wallet")
    public ResponseEntity<Map<String, String>> updateWalletAddress(
            @PathVariable String id,
            @RequestBody WalletUpdateRequest request) {
        try {
            userService.updateWalletAddress(id, request.getWalletAddress());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Adresse wallet mise à jour et notification envoyée avec succès.");
            response.put("userId", id);
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
}
}