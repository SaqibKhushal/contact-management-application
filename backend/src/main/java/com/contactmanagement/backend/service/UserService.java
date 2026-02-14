package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.*;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.exception.CustomException;
import com.contactmanagement.backend.repository.UserRepository;
import com.contactmanagement.backend.security.JwtUtil;
import com.contactmanagement.backend.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for user management operations.
 * Handles authentication, registration, profile updates, and account management.
 */
@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SecurityUtils securityUtils;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil, SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.securityUtils = securityUtils;
    }
    
    @Transactional
    public User registerUser(RegisterRequest request) {
        logger.info("Attempting to register user with email: {}", request.getEmail());
        
        // Validate that at least email or phone is provided
        if (request.getEmail() == null && request.getPhoneNumber() == null) {
            throw new CustomException("Either email or phone number must be provided");
        }
        
        // Check if email already exists
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already registered");
        }
        
        // Check if phone number already exists
        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new CustomException("Phone number already registered");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with ID: {}", savedUser.getId());
        
        return savedUser;
    }
    
    public LoginResponse login(LoginRequest request) {
        logger.info("Login attempt for username: {}", request.getUsername());
        
        // Find user by email or phone
        User user = userRepository.findByEmail(request.getUsername())
                .orElseGet(() -> userRepository.findByPhoneNumber(request.getUsername())
                        .orElseThrow(() -> new CustomException("Invalid username or password")));
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Failed login attempt for username: {}", request.getUsername());
            throw new CustomException("Invalid username or password");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail() != null ? user.getEmail() : user.getPhoneNumber());
        
        logger.info("User logged in successfully: {}", request.getUsername());
        return new LoginResponse(token, "Login successful");
    }
    
    public UserProfileDTO getUserProfile() {
        // Get the currently authenticated user from JWT token
        User user = securityUtils.getCurrentUser();
        
        UserProfileDTO profile = new UserProfileDTO();
        profile.setId(user.getId());
        profile.setEmail(user.getEmail());
        profile.setPhoneNumber(user.getPhoneNumber());
        profile.setFirstName(user.getFirstName());
        profile.setLastName(user.getLastName());
        
        return profile;
    }
    
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        logger.info("Password change attempt");
        
        // Get the currently authenticated user from JWT token
        User user = securityUtils.getCurrentUser();
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            logger.warn("Current password is incorrect for user: {}", user.getEmail());
            throw new CustomException("Current password is incorrect");
        }
        
        // Update password with new encrypted password
        String newEncryptedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(newEncryptedPassword);
        userRepository.save(user);
        
        logger.info("Password changed successfully for user: {}", user.getEmail());
    }
    
    @Transactional
    public UserProfileDTO updateUserProfile(UserProfileDTO profileDTO) {
        logger.info("Updating user profile");
        
        // Get the currently authenticated user from JWT token
        User user = securityUtils.getCurrentUser();
        
        // Update user information
        if (profileDTO.getFirstName() != null) {
            user.setFirstName(profileDTO.getFirstName());
        }
        if (profileDTO.getLastName() != null) {
            user.setLastName(profileDTO.getLastName());
        }
        if (profileDTO.getEmail() != null && !profileDTO.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(profileDTO.getEmail())) {
                throw new CustomException("Email already in use");
            }
            user.setEmail(profileDTO.getEmail());
        }
        if (profileDTO.getPhoneNumber() != null && !profileDTO.getPhoneNumber().equals(user.getPhoneNumber())) {
            // Check if new phone already exists
            if (userRepository.existsByPhoneNumber(profileDTO.getPhoneNumber())) {
                throw new CustomException("Phone number already in use");
            }
            user.setPhoneNumber(profileDTO.getPhoneNumber());
        }
        
        @SuppressWarnings("null")
        User updatedUser = userRepository.save(user);
        logger.info("User profile updated successfully");
        
        // Return updated profile
        UserProfileDTO updated = new UserProfileDTO();
        updated.setId(updatedUser.getId());
        updated.setEmail(updatedUser.getEmail());
        updated.setPhoneNumber(updatedUser.getPhoneNumber());
        updated.setFirstName(updatedUser.getFirstName());
        updated.setLastName(updatedUser.getLastName());
        
        return updated;
    }
    
    @Transactional
    public void deleteAccount() {
        logger.info("Deleting user account");
        
        // Get the currently authenticated user from JWT token
        User user = securityUtils.getCurrentUser();
        
        // Delete the user (cascade will handle related contacts)
        if (user != null) {
            userRepository.delete(user);
            logger.info("User account deleted successfully");
        }
    }
}