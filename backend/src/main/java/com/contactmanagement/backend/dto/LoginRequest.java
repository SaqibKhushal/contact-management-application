package com.contactmanagement.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank(message = "Username is required")
    private String username; // email or phone
    
    @NotBlank(message = "Password is required")
    private String password;
}