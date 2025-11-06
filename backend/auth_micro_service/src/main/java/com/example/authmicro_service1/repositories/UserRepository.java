package com.example.authmicro_service1.repositories;

import com.example.authmicro_service1.entities.UserEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CrudRepository<UserEntity, Long> {

    UserEntity findByEmail(String email);

    UserEntity findByUserId(String userId);


    UserEntity findByEmailAndVerificationCode(String email, String verificationCode);


}
