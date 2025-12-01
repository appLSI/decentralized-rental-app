package com.example.authmicro_service1.repositories;

import com.example.authmicro_service1.entities.UserEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByUserId(String userId);

    Optional<UserEntity> findByEmailAndVerificationCode(String email, String verificationCode);

    Optional<UserEntity> findByWalletAddress(String walletAddress);
}