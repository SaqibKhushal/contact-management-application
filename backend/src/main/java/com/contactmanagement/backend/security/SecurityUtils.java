package com.contactmanagement.backend.security;

import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.exception.ResourceNotFoundException;
import com.contactmanagement.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Helper class to get the currently authenticated user from SecurityContext
 * 
 * CRITICAL FOR USER SESSION ISOLATION:
 * This replaces the unsafe "getDefaultUser()" pattern that always returned the first user,
 * causing serious data leakage where User B would see User A's data after logout/login.
 * 
 * Now, every request extracts the authenticated user from the JWT token in the SecurityContext.
 */
@Component
public class SecurityUtils {

    private final UserRepository userRepository;
    
    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get the currently authenticated user from JWT token in SecurityContext
     * 
     * @return User entity of the authenticated user
     * @throws ResourceNotFoundException if no user is authenticated or user not found
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated user found. Please login.");
        }

        Object principal = authentication.getPrincipal();
        String username;
        
        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else {
            username = principal.toString();
        }

        // Find user by email or phone number
        return userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByPhoneNumber(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username)));
    }

    /**
     * Get the username of the currently authenticated user
     * 
     * @return username (email or phone)
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        
        return principal.toString();
    }

    /**
     * Check if a user is currently authenticated
     * 
     * @return true if authenticated, false otherwise
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
