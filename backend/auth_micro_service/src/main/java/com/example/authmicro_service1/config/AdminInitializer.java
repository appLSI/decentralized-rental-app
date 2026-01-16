package com.example.authmicro_service1.config;

import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.entities.UserRole;
import com.example.authmicro_service1.entities.UserType;
import com.example.authmicro_service1.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder ;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin already exists
        Optional<UserEntity> existingAdmin = Optional.ofNullable(userRepository.findByEmail("daar.chain@gmail.com"));

        if (!existingAdmin.isPresent()) {
            UserEntity admin = new UserEntity();
            admin.setUserId(UUID.randomUUID().toString());
            admin.setFirstname("Admin");
            admin.setLastname("System");
            admin.setEmail("daar.chain@gmail.com");
            admin.setEncrypted_password(passwordEncoder.encode("Admin@123"));
            admin.setEmailVerficationStatus(true);

            // Set admin role and type
            Set<UserRole> roles = new HashSet<>();
            roles.add(UserRole.ADMIN);
            admin.setRoles(roles);

            Set<UserType> types = new HashSet<>();
            types.add(UserType.CLIENT);
            admin.setTypes(types);

            userRepository.save(admin);
            System.out.println("✅ Admin user created successfully!");
            System.out.println("Email: admin@example.com");
            System.out.println("Password: Admin@123");
        } else {
            System.out.println("ℹ️ Admin user already exists");
        }
    }
}