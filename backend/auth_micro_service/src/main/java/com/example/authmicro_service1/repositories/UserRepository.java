package com.example.authmicro_service1.repositories;

import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.entities.UserRole;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends CrudRepository<UserEntity, Long> {

    UserEntity findByEmail(String email);

    UserEntity findByUserId(String userId);

    UserEntity findByEmailAndVerificationCode(String email, String verificationCode);

    // NOUVELLE MÉTHODE : Trouver tous les utilisateurs ayant un rôle spécifique
    List<UserEntity> findByRolesContaining(UserRole role);

    // ✅ NOUVELLE MÉTHODE : Trouver un utilisateur par son wallet address
    // Permet de vérifier l'unicité du wallet
    UserEntity findByWalletAddress(String walletAddress);
}