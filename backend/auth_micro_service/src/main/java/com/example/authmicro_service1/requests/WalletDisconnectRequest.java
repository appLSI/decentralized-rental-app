package com.example.authmicro_service1.requests;

public class WalletDisconnectRequest {
    private String reason; // Optionnel : raison de la déconnexion

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}