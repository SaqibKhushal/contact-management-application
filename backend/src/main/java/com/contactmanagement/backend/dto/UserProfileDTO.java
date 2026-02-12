package com.contactmanagement.backend.dto;

import lombok.Data;

@Data
public class UserProfileDTO {
    private Long id;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;
}