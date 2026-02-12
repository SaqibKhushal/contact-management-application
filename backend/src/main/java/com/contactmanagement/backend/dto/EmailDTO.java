package com.contactmanagement.backend.dto;

import lombok.Data;

@Data
public class EmailDTO {
    private Long id;
    private String email;
    private String label;
}