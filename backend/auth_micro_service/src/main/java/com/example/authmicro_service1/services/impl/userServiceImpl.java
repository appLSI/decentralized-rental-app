package com.example.authmicro_service1.services.impl;

import com.example.authmicro_service1.dto.UserDto;
import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.entities.UserRole;
import com.example.authmicro_service1.entities.UserType;
import com.example.authmicro_service1.repositories.UserRepository;
import com.example.authmicro_service1.services.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class userServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public UserDto createUser(UserDto userDto) {
        // Check if user already exists
        Optional<UserEntity> existingUser = userRepository.findByEmail(userDto.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        UserEntity userEntity = new UserEntity();
        BeanUtils.copyProperties(userDto, userEntity);

        // Generate unique userId
        String userId = UUID.randomUUID().toString();
        userEntity.setUserId(userId);

        // Hash password
        userEntity.setEncrypted_password(passwordEncoder.encode(userDto.getPassword()));

        // Set default USER role if no roles specified
        if (userEntity.getRoles() == null || userEntity.getRoles().isEmpty()) {
            Set<UserRole> defaultRoles = new HashSet<>();
            defaultRoles.add(UserRole.USER);
            userEntity.setRoles(defaultRoles);
        }

        // Set default CLIENT type if no types specified
        if (userEntity.getTypes() == null || userEntity.getTypes().isEmpty()) {
            Set<UserType> defaultTypes = new HashSet<>();
            defaultTypes.add(UserType.CLIENT);
            userEntity.setTypes(defaultTypes);
        }

        // Email verification disabled by default
        userEntity.setEmailVerficationStatus(false);

        // Generate OTP code
        String verificationCode = generateOTP();
        userEntity.setVerificationCode(verificationCode);
        userEntity.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));

        // Save user
        UserEntity savedUser = userRepository.save(userEntity);

        // Send verification email
        try {
            emailService.sendOTPEmail(savedUser.getEmail(), verificationCode);
        } catch (Exception e) {
            System.err.println("Error sending verification email: " + e.getMessage());
        }

        // Return DTO
        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(savedUser, returnValue);
        return returnValue;
    }

    @Override
    public UserDto getUser(String email) {
        Optional<UserEntity> userEntity = userRepository.findByEmail(email);
        if (!userEntity.isPresent()) {
            throw new UsernameNotFoundException("Aucun utilisateur trouvé avec l'email: " + email);
        }

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(userEntity.get(), returnValue);
        return returnValue;
    }

    @Override
    public UserDto getUserByUserId(String userId) {
        Optional<UserEntity> userEntity = userRepository.findByUserId(userId);
        if (!userEntity.isPresent()) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(userEntity.get(), returnValue);
        return returnValue;
    }

    @Override
    public UserDto updateUser(String id, UserDto userDto) {
        Optional<UserEntity> userEntity = userRepository.findByUserId(id);
        if (!userEntity.isPresent()) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        UserEntity user = userEntity.get();

        // Update fields
        if (userDto.getFirstname() != null) user.setFirstname(userDto.getFirstname());
        if (userDto.getLastname() != null) user.setLastname(userDto.getLastname());
        if (userDto.getPhone() != null) user.setPhone(userDto.getPhone());
        if (userDto.getCountry() != null) user.setCountry(userDto.getCountry());
        if (userDto.getCity() != null) user.setCity(userDto.getCity());
        if (userDto.getState() != null) user.setState(userDto.getState());
        if (userDto.getAddress() != null) user.setAddress(userDto.getAddress());
        if (userDto.getProfile_image() != null) user.setProfile_image(userDto.getProfile_image());

        UserEntity updatedUser = userRepository.save(user);

        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(updatedUser, returnValue);
        return returnValue;
    }

    @Override
    public boolean verifyOTP(String email, String code) {
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        UserEntity user = userOpt.get();

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            return false;
        }

        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le code de vérification a expiré");
        }

        user.setEmailVerficationStatus(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);

        return true;
    }

    @Override
    public void resendOTP(String email) {
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        UserEntity user = userOpt.get();

        String newCode = generateOTP();
        user.setVerificationCode(newCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendOTPEmail(email, newCode);
    }

    @Override
    public void requestPasswordReset(String email) {
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new UsernameNotFoundException("Aucun compte n'existe avec cet email");
        }

        UserEntity user = userOpt.get();

        String resetCode = generateOTP();
        user.setPasswordResetCode(resetCode);
        user.setPasswordResetCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(email, resetCode);
    }

    @Override
    public boolean resetPassword(String email, String code, String newPassword) {
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Utilisateur non trouvé");
        }

        UserEntity user = userOpt.get();

        if (user.getPasswordResetCode() == null || !user.getPasswordResetCode().equals(code)) {
            return false;
        }

        if (user.getPasswordResetCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le code de réinitialisation a expiré");
        }

        user.setEncrypted_password(passwordEncoder.encode(newPassword));
        user.setPasswordResetCode(null);
        user.setPasswordResetCodeExpiresAt(null);
        userRepository.save(user);

        return true;
    }

    @Override
    public void updateWalletAddress(String userId, String walletAddress) {
        Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
        if (!userOpt.isPresent()) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        UserEntity user = userOpt.get();
        user.setWalletAddress(walletAddress);
        userRepository.save(user);
    }

    // ========== ADMIN METHODS ==========

    @Override
    public UserDto createAgent(UserDto userDto, String adminUserId) {
        // Verify that the requester is an ADMIN
        Optional<UserEntity> adminOpt = userRepository.findByUserId(adminUserId);
        if (!adminOpt.isPresent()) {
            throw new RuntimeException("Admin non trouvé");
        }

        UserEntity admin = adminOpt.get();
        if (!admin.getRoles().contains(UserRole.ADMIN)) {
            throw new RuntimeException("Vous n'avez pas les permissions pour créer un agent");
        }

        // Check if agent email already exists
        Optional<UserEntity> existingUser = userRepository.findByEmail(userDto.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        UserEntity agentEntity = new UserEntity();
        BeanUtils.copyProperties(userDto, agentEntity);

        // Generate unique userId
        String userId = UUID.randomUUID().toString();
        agentEntity.setUserId(userId);

        // Hash password
        agentEntity.setEncrypted_password(passwordEncoder.encode(userDto.getPassword()));

        // Set AGENT role
        Set<UserRole> agentRoles = new HashSet<>();
        agentRoles.add(UserRole.AGENT);
        agentEntity.setRoles(agentRoles);

        // Agent can be both HOST and CLIENT
        Set<UserType> agentTypes = new HashSet<>();
        agentTypes.add(UserType.HOST);
        agentTypes.add(UserType.CLIENT);
        agentEntity.setTypes(agentTypes);

        // Agent is pre-verified (no OTP needed)
        agentEntity.setEmailVerficationStatus(true);

        // Save agent
        UserEntity savedAgent = userRepository.save(agentEntity);

        // Send welcome email to agent
        try {
            emailService.sendAgentWelcomeEmail(savedAgent.getEmail(), userDto.getPassword());
        } catch (Exception e) {
            System.err.println("Error sending agent welcome email: " + e.getMessage());
        }

        // Return DTO
        UserDto returnValue = new UserDto();
        BeanUtils.copyProperties(savedAgent, returnValue);
        return returnValue;
    }

    @Override
    public List<UserDto> getAllAgents() {
        List<UserEntity> allUsers = (List<UserEntity>) userRepository.findAll();

        List<UserEntity> agents = allUsers.stream()
                .filter(user -> user.getRoles().contains(UserRole.AGENT))
                .collect(Collectors.toList());

        return agents.stream()
                .map(agent -> {
                    UserDto dto = new UserDto();
                    BeanUtils.copyProperties(agent, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAgent(String agentId, String adminUserId) {
        // Verify admin
        Optional<UserEntity> adminOpt = userRepository.findByUserId(adminUserId);
        if (!adminOpt.isPresent()) {
            throw new RuntimeException("Admin non trouvé");
        }

        UserEntity admin = adminOpt.get();
        if (!admin.getRoles().contains(UserRole.ADMIN)) {
            throw new RuntimeException("Vous n'avez pas les permissions pour supprimer un agent");
        }

        // Find and verify agent
        Optional<UserEntity> agentOpt = userRepository.findByUserId(agentId);
        if (!agentOpt.isPresent()) {
            throw new RuntimeException("Agent non trouvé");
        }

        UserEntity agent = agentOpt.get();
        if (!agent.getRoles().contains(UserRole.AGENT)) {
            throw new RuntimeException("Cet utilisateur n'est pas un agent");
        }

        // Don't allow deleting the last admin
        if (agent.getRoles().contains(UserRole.ADMIN)) {
            List<UserEntity> allUsers = (List<UserEntity>) userRepository.findAll();
            long adminCount = allUsers.stream()
                    .filter(u -> u.getRoles().contains(UserRole.ADMIN))
                    .count();

            if (adminCount <= 1) {
                throw new RuntimeException("Impossible de supprimer le dernier administrateur");
            }
        }

        userRepository.delete(agent);
    }

    // ========== SPRING SECURITY ==========

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new UsernameNotFoundException("Aucun utilisateur trouvé avec l'email: " + email);
        }

        UserEntity user = userOpt.get();

        if (!user.getEmailVerficationStatus()) {
            throw new RuntimeException("Veuillez vérifier votre email avant de vous connecter");
        }

        return User.builder()
                .username(user.getEmail())
                .password(user.getEncrypted_password())
                .roles(user.getRoles().stream().map(Enum::name).toArray(String[]::new))
                .build();
    }

    // ========== HELPER METHODS ==========

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}