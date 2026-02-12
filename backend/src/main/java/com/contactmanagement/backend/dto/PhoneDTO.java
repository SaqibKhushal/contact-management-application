package com.contactmanagement.backend.dto;

import lombok.Data;

@Data
public class PhoneDTO {
    private Long id;
    private String phone;
    private String label;
}