package com.contactmanagement.backend.controller;

import com.contactmanagement.backend.dto.ChangePasswordRequest;
import com.contactmanagement.backend.dto.UserProfileDTO;
import com.contactmanagement.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for user profile management.
 * Handles profile updates, password changes, and account deletion.
 */
@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile() {
        logger.debug("Fetching user profile");
        UserProfileDTO profile = userService.getUserProfile();
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(@Valid @RequestBody UserProfileDTO profileDTO) {
        logger.info("Updating user profile");
        UserProfileDTO updated = userService.updateUserProfile(profileDTO);
        logger.info("User profile updated successfully");
        return ResponseEntity.ok(updated);
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        logger.info("Password change request received");
        userService.changePassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        logger.info("Password changed successfully");
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount() {
        logger.warn("Account deletion request received");
        userService.deleteAccount();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account deleted successfully");
        logger.info("Account deleted successfully");
        return ResponseEntity.ok(response);
    }
}