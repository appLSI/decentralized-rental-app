package com.example.authmicro_service1.controller;

import com.example.authmicro_service1.requests.WalletUpdateRequest;
import com.example.authmicro_service1.services.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller dédié à la gestion des wallets blockchain
 */
@RestController
@RequestMapping("/users/{userId}/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    /**
     * Connecter un wallet à l'utilisateur
     * POST /users/{userId}/wallet/connect
     */
    @PostMapping("/connect")
    public ResponseEntity<Map<String, Object>> connectWallet(
            @PathVariable String userId,
            @RequestBody WalletUpdateRequest request) {
        try {
            Map<String, Object> response = walletService.connectWallet(userId, request.getWalletAddress());
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Déconnecter le wallet de l'utilisateur
     * DELETE /users/{userId}/wallet/disconnect
     */
    @DeleteMapping("/disconnect")
    public ResponseEntity<Map<String, Object>> disconnectWallet(@PathVariable String userId) {
        try {
            Map<String, Object> response = walletService.disconnectWallet(userId);

            // Si canDisconnect = false, retourner 400 avec les raisons
            if (!(boolean) response.get("canDisconnect")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Vérifier si l'utilisateur peut déconnecter son wallet
     * GET /users/{userId}/wallet/can-disconnect
     */
    @GetMapping("/can-disconnect")
    public ResponseEntity<Map<String, Object>> canDisconnectWallet(@PathVariable String userId) {
        try {
            Map<String, Object> validation = walletService.validateWalletDisconnection(userId);
            return ResponseEntity.ok(validation);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Erreur lors de la validation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtenir le statut du wallet de l'utilisateur
     * GET /users/{userId}/wallet/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getWalletStatus(@PathVariable String userId) {
        try {
            Map<String, Object> status = walletService.getWalletStatus(userId);
            return ResponseEntity.ok(status);
        } catch (UsernameNotFoundException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}