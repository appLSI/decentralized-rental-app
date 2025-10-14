package com.example.authmicro_service1.services.impl;

import com.example.authmicro_service1.dto.UserDto;
import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.repositories.UserRepository;
import com.example.authmicro_service1.services.UserService;
import com.example.authmicro_service1.shared.OTPGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

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

    private static final int OTP_EXPIRATION_MINUTES = 15;

    @Override
    public UserDto createUser(UserDto userDto) {
        // Vérifier si l'email existe déjà
        UserEntity existingUser = userRepository.findByEmail(userDto.getEmail());
        if (existingUser != null) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        UserEntity userEntity = new UserEntity();
        BeanUtils.copyProperties(userDto, userEntity);

        // Générer un userId unique
        userEntity.setUserId(otpGenerator.generateUserId(30));

        // Crypter le mot de passe
        userEntity.setEncrypted_password(passwordEncoder.encode(userDto.getPassword()));

        // Générer le code OTP
        String otp = otpGenerator.generateOTP();
        userEntity.setVerificationCode(otp);
        userEntity.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        userEntity.setEmailVerficationStatus(false);

        // Sauvegarder l'utilisateur
        UserEntity savedUser = userRepository.save(userEntity);

        // Envoyer l'email avec le code OTP
        emailService.sendVerificationCode(savedUser.getEmail(), otp);

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(savedUser, returnValue);

        return returnValue;
    }

    /**
     * Vérifie le code OTP fourni par l'utilisateur
     */
    public boolean verifyOTP(String email, String code) {
        UserEntity userEntity = userRepository.findByEmail(email);

        if (userEntity == null) {
            throw new RuntimeException("Utilisateur non trouvé");
        }

        // Vérifier si l'email est déjà vérifié
        if (userEntity.getEmailVerficationStatus()) {
            throw new RuntimeException("L'email est déjà vérifié");
        }

        // Vérifier si le code correspond
        if (!code.equals(userEntity.getVerificationCode())) {
            return false;
        }

        // Vérifier si le code n'a pas expiré
        if (userEntity.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le code de vérification a expiré");
        }

        // Marquer l'email comme vérifié
        userEntity.setEmailVerficationStatus(true);
        userEntity.setVerificationCode(null);
        userEntity.setVerificationCodeExpiresAt(null);
        userRepository.save(userEntity);

        return true;
    }

    /**
     * Renvoie un nouveau code OTP
     */
    public void resendOTP(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);

        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        if (userEntity.getEmailVerficationStatus()) {
            throw new RuntimeException("L'email est déjà vérifié");
        }

        // Générer un nouveau code OTP
        String newOTP = otpGenerator.generateOTP();
        userEntity.setVerificationCode(newOTP);
        userEntity.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        userRepository.save(userEntity);

        // Envoyer l'email
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
        return userDto;
    }

    @Override
    public UserDto updateUser(String id, UserDto userDto) {
        UserEntity userEntity = userRepository.findByUserId(id);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        // Mettre à jour les champs
        if (userDto.getFirstname() != null) userEntity.setFirstname(userDto.getFirstname());
        if (userDto.getLastname() != null) userEntity.setLastname(userDto.getLastname());
        if (userDto.getPhone() != null) userEntity.setPhone(userDto.getPhone());
        if (userDto.getCountry() != null) userEntity.setCountry(userDto.getCountry());
        if (userDto.getCity() != null) userEntity.setCity(userDto.getCity());
        if (userDto.getState() != null) userEntity.setState(userDto.getState());
        if (userDto.getDate_of_birth() != null) userEntity.setDate_of_birth(userDto.getDate_of_birth());
        if (userDto.getAddress() != null) userEntity.setAddress(userDto.getAddress());
        if (userDto.getProfile_image() != null) userEntity.setProfile_image(userDto.getProfile_image());

        // Si un nouveau mot de passe est fourni
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            userEntity.setEncrypted_password(passwordEncoder.encode(userDto.getPassword()));
        }

        UserEntity updatedUser = userRepository.save(userEntity);

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(updatedUser, returnValue);
        return returnValue;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + email);
        }

        // Vérifier si l'email est vérifié
        if (!userEntity.getEmailVerficationStatus()) {
            throw new RuntimeException("Veuillez vérifier votre email avant de vous connecter");
        }

        return new User(userEntity.getEmail(), userEntity.getEncrypted_password(), new ArrayList<>());
    }
}