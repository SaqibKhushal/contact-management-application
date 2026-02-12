package com.contactmanagement.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ContactDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String title;
    private List<EmailDTO> emailAddresses;
    private List<PhoneDTO> phoneNumbers;
    private String profileImage;
    private List<String> tags;
    private Boolean isFavorite;
}