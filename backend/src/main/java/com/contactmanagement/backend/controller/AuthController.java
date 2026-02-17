package com.contactmanagement.backend.controller;

import com.contactmanagement.backend.dto.*;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for authentication operations.
 * Handles user registration and login.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;
    
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("Registration request received for email: {}", request.getEmail());
        User user = userService.registerUser(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", user.getId().toString());
        logger.info("User registered successfully with ID: {}", user.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login request received for username: {}", request.getUsername());
        LoginResponse response = userService.login(request);
        logger.info("Login successful for username: {}", request.getUsername());
        return ResponseEntity.ok(response);
    }
}