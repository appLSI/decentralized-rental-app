package com.example.authmicro_service1.dto;

import java.io.Serializable;

public class WalletProvidedMessage implements Serializable {

    private String userId;
    private String walletAddress;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getWalletAddress() {
        return walletAddress;
    }

    public void setWalletAddress(String walletAddress) {
        this.walletAddress = walletAddress;
    }
}