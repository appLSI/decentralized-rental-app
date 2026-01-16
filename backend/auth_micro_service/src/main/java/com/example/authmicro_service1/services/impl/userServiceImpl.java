package com.example.authmicro_service1.services.impl;

import com.example.authmicro_service1.Producer.RabbitMQProducer;
import com.example.authmicro_service1.dto.UserDto;
import com.example.authmicro_service1.dto.WalletProvidedMessage;
import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.entities.UserRole;
import com.example.authmicro_service1.entities.UserType;
import com.example.authmicro_service1.repositories.UserRepository;
import com.example.authmicro_service1.services.UserService;
import com.example.authmicro_service1.shared.OTPGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service("userServiceImpl")
public class userServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OTPGenerator otpGenerator;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    private static final int OTP_EXPIRATION_MINUTES = 15;

    @Override
    public UserDto createUser(UserDto userDto) {
        UserEntity existingUser = userRepository.findByEmail(userDto.getEmail());
        if (existingUser != null) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        UserEntity userEntity = new UserEntity();
        BeanUtils.copyProperties(userDto, userEntity);

        // ✅ 1. Rôle USER par défaut si non fourni
        if (userEntity.getRoles() == null || userEntity.getRoles().isEmpty()) {
            Set<UserRole> roles = new HashSet<>();
            roles.add(UserRole.USER);
            userEntity.setRoles(roles);
        }

        // ✅ 2. Type CLIENT par défaut si non fourni (CORRECTION)
        if (userEntity.getTypes() == null || userEntity.getTypes().isEmpty()) {
            Set<UserType> types = new HashSet<>();
            types.add(UserType.CLIENT);  // ✅ CORRECTION ICI
            userEntity.setTypes(types);
        }

        userEntity.setUserId(otpGenerator.generateUserId(30));
        userEntity.setEncrypted_password(passwordEncoder.encode(userDto.getPassword()));

        String otp = otpGenerator.generateOTP();
        userEntity.setVerificationCode(otp);
        userEntity.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        userEntity.setEmailVerficationStatus(false);

        UserEntity savedUser = userRepository.save(userEntity);
        emailService.sendVerificationCode(savedUser.getEmail(), otp);

        // Publier l'événement de création
        rabbitMQProducer.publishUserCreated(
                savedUser.getUserId(),
                savedUser.getWalletAddress()
        );

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(savedUser, returnValue);
        returnValue.setRoles(savedUser.getRoles() != null ? savedUser.getRoles() : new HashSet<>());
        returnValue.setTypes(savedUser.getTypes() != null ? savedUser.getTypes() : new HashSet<>());

        return returnValue;
    }

    public boolean verifyOTP(String email, String code) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        if (userEntity.getEmailVerficationStatus()) {
            throw new RuntimeException("L'email est déjà vérifié");
        }
        if (!code.equals(userEntity.getVerificationCode())) {
            return false;
        }
        if (userEntity.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le code de vérification a expiré");
        }

        userEntity.setEmailVerficationStatus(true);
        userEntity.setVerificationCode(null);
        userEntity.setVerificationCodeExpiresAt(null);
        userRepository.save(userEntity);
        return true;
    }

    public void resendOTP(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        // Générer un nouvel OTP peu importe si l'email est vérifié
        String newOTP = otpGenerator.generateOTP();
        userEntity.setVerificationCode(newOTP);
        userEntity.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        userRepository.save(userEntity);

        emailService.sendVerificationCode(userEntity.getEmail(), newOTP);
    }


    @Override
    public UserDto getUser(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + email);
        }

        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userEntity, userDto);
        userDto.setRoles(userEntity.getRoles() != null ? userEntity.getRoles() : new HashSet<>());
        userDto.setTypes(userEntity.getTypes() != null ? userEntity.getTypes() : new HashSet<>());
        return userDto;
    }

    @Override
    public UserDto getUserByUserId(String userId) {
        UserEntity userEntity = userRepository.findByUserId(userId);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userEntity, userDto);
        userDto.setRoles(userEntity.getRoles() != null ? userEntity.getRoles() : new HashSet<>());
        userDto.setTypes(userEntity.getTypes() != null ? userEntity.getTypes() : new HashSet<>());
        return userDto;
    }

    @Override
    public UserDto updateUser(String id, UserDto userDto) {
        UserEntity userEntity = userRepository.findByUserId(id);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        if (userDto.getFirstname() != null) userEntity.setFirstname(userDto.getFirstname());
        if (userDto.getLastname() != null) userEntity.setLastname(userDto.getLastname());
        if (userDto.getPhone() != null) userEntity.setPhone(userDto.getPhone());
        if (userDto.getCountry() != null) userEntity.setCountry(userDto.getCountry());
        if (userDto.getCity() != null) userEntity.setCity(userDto.getCity());
        if (userDto.getState() != null) userEntity.setState(userDto.getState());
        if (userDto.getDate_of_birth() != null) userEntity.setDate_of_birth(userDto.getDate_of_birth());
        if (userDto.getAddress() != null) userEntity.setAddress(userDto.getAddress());
        if (userDto.getProfile_image() != null) userEntity.setProfile_image(userDto.getProfile_image());

        // ✅ Mettre à jour les rôles si fournis
        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            userEntity.setRoles(userDto.getRoles());
        }

        // ✅ Mettre à jour les types si fournis
        if (userDto.getTypes() != null) {
            userEntity.setTypes(userDto.getTypes());
        }

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            userEntity.setEncrypted_password(passwordEncoder.encode(userDto.getPassword()));
        }

        UserEntity updatedUser = userRepository.save(userEntity);

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(updatedUser, returnValue);
        returnValue.setRoles(updatedUser.getRoles() != null ? updatedUser.getRoles() : new HashSet<>());
        returnValue.setTypes(updatedUser.getTypes() != null ? updatedUser.getTypes() : new HashSet<>());
        return returnValue;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + email);
        }
        if (!userEntity.getEmailVerficationStatus()) {
            throw new RuntimeException("Veuillez vérifier votre email avant de vous connecter");
        }

        // ✅ Convertir les rôles en GrantedAuthority
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (userEntity.getRoles() != null && !userEntity.getRoles().isEmpty()) {
            authorities = userEntity.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                    .collect(Collectors.toList());
        }

        return new User(userEntity.getEmail(), userEntity.getEncrypted_password(), authorities);
    }





    /**
     * Demande de réinitialisation de mot de passe
     * Génère un code OTP et l'envoie par email
     */
    @Override
    public void requestPasswordReset(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);

        if (userEntity == null) {
            throw new UsernameNotFoundException("Aucun compte n'existe avec cet email");
        }

        // Générer un code OTP pour la réinitialisation
        String resetCode = otpGenerator.generateOTP();
        userEntity.setPasswordResetCode(resetCode);
        userEntity.setPasswordResetCodeExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        userRepository.save(userEntity);

        // Envoyer l'email avec le code
        emailService.sendPasswordResetCode(userEntity.getEmail(), resetCode);
    }

    /**
     * Réinitialise le mot de passe avec le code OTP
     */
    @Override
    public boolean resetPassword(String email, String code, String newPassword) {
        UserEntity userEntity = userRepository.findByEmail(email);

        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        // Vérifier si le code correspond
        if (userEntity.getPasswordResetCode() == null ||
                !code.equals(userEntity.getPasswordResetCode())) {
            return false;
        }

        // Vérifier si le code n'a pas expiré
        if (userEntity.getPasswordResetCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le code de réinitialisation a expiré");
        }

        // Réinitialiser le mot de passe
        userEntity.setEncrypted_password(passwordEncoder.encode(newPassword));
        userEntity.setPasswordResetCode(null);
        userEntity.setPasswordResetCodeExpiresAt(null);
        userRepository.save(userEntity);

        return true;
    }



    public UserDto updateWalletAddress(String userId, String newWalletAddress) {
        UserEntity userEntity = userRepository.findByUserId(userId);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        userEntity.setWalletAddress(newWalletAddress);
        UserEntity updatedUser = userRepository.save(userEntity);

        // ✅ PUBLIER L'ÉVÉNEMENT DE MISE À JOUR
        rabbitMQProducer.publishUserUpdated(
                updatedUser.getUserId(),
                updatedUser.getWalletAddress()
        );

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(updatedUser, returnValue);
        return returnValue;
    }
}