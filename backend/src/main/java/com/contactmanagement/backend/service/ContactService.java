package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.ContactDTO;
import com.contactmanagement.backend.dto.EmailDTO;
import com.contactmanagement.backend.dto.PhoneDTO;
import com.contactmanagement.backend.entity.*;
import com.contactmanagement.backend.exception.CustomException;
import com.contactmanagement.backend.exception.ResourceNotFoundException;
import com.contactmanagement.backend.repository.ContactRepository;
import com.contactmanagement.backend.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

/**
 * Service class for managing contact operations.
 * Handles CRUD operations for contacts with user isolation.
 */
@Service
public class ContactService {
    
    private static final Logger logger = LoggerFactory.getLogger(ContactService.class);
    private static final String CONTACT_NOT_FOUND = "Contact not found";
    
    private final ContactRepository contactRepository;
    private final SecurityUtils securityUtils;
    
    public ContactService(ContactRepository contactRepository, SecurityUtils securityUtils) {
        this.contactRepository = contactRepository;
        this.securityUtils = securityUtils;
    }
    
    public Page<ContactDTO> getAllContacts(Pageable pageable) {
        User user = securityUtils.getCurrentUser();
        Page<Contact> contacts = contactRepository.findByUserId(user.getId(), pageable);
        return contacts.map(this::convertToDTO);
    }
    
    public Page<ContactDTO> searchContacts(String search, Pageable pageable) {
        User user = securityUtils.getCurrentUser();
        Page<Contact> contacts = contactRepository.searchContacts(user.getId(), search, pageable);
        return contacts.map(this::convertToDTO);
    }
    
    public ContactDTO getContactById(Long contactId) {
        User user = securityUtils.getCurrentUser();
        @SuppressWarnings("null")
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND));
        
        if (!contact.getUser().getId().equals(user.getId())) {
            throw new CustomException("Access denied");
        }
        
        return convertToDTO(contact);
    }
    
    @Transactional
    public ContactDTO createContact(ContactDTO contactDTO) {
        logger.info("Creating new contact");
        
        User user = securityUtils.getCurrentUser();
        
        Contact contact = new Contact();
        contact.setUser(user);
        contact.setFirstName(contactDTO.getFirstName());
        contact.setLastName(contactDTO.getLastName());
        contact.setTitle(contactDTO.getTitle());
        contact.setProfileImage(contactDTO.getProfileImage());
        contact.setTags(contactDTO.getTags() != null ? contactDTO.getTags() : new ArrayList<>());
        contact.setIsFavorite(contactDTO.getIsFavorite() != null && contactDTO.getIsFavorite());
        
        // Add email addresses
        if (contactDTO.getEmailAddresses() != null) {
            contactDTO.getEmailAddresses().forEach(emailDTO -> {
                EmailAddress email = new EmailAddress();
                email.setEmail(emailDTO.getEmail());
                email.setLabel(emailDTO.getLabel());
                email.setContact(contact);
                contact.getEmailAddresses().add(email);
            });
        }
        
        // Add phone numbers
        if (contactDTO.getPhoneNumbers() != null) {
            contactDTO.getPhoneNumbers().forEach(phoneDTO -> {
                PhoneNumber phone = new PhoneNumber();
                phone.setPhone(phoneDTO.getPhone());
                phone.setLabel(phoneDTO.getLabel());
                phone.setContact(contact);
                contact.getPhoneNumbers().add(phone);
            });
        }
        
        Contact savedContact = contactRepository.save(contact);
        logger.info("Contact created with ID: {}", savedContact.getId());
        
        return convertToDTO(savedContact);
    }
    
    @Transactional
    public ContactDTO updateContact(Long contactId, ContactDTO contactDTO) {
        logger.info("Updating contact ID: {}", contactId);
        
        User user = securityUtils.getCurrentUser();
        @SuppressWarnings("null")
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND));
        
        if (!contact.getUser().getId().equals(user.getId())) {
            throw new CustomException("Access denied");
        }
        
        contact.setFirstName(contactDTO.getFirstName());
        contact.setLastName(contactDTO.getLastName());
        contact.setTitle(contactDTO.getTitle());
        
        // Update profile image only if provided
        if (contactDTO.getProfileImage() != null && !contactDTO.getProfileImage().isEmpty()) {
            contact.setProfileImage(contactDTO.getProfileImage());
        }
        
        // Update tags
        if (contactDTO.getTags() != null) {
            contact.setTags(contactDTO.getTags());
        }
        
        // Update favorite status
        if (contactDTO.getIsFavorite() != null) {
            contact.setIsFavorite(contactDTO.getIsFavorite());
        }
        
        // Update email addresses
        contact.getEmailAddresses().clear();
        if (contactDTO.getEmailAddresses() != null) {
            contactDTO.getEmailAddresses().forEach(emailDTO -> {
                EmailAddress email = new EmailAddress();
                email.setEmail(emailDTO.getEmail());
                email.setLabel(emailDTO.getLabel());
                email.setContact(contact);
                contact.getEmailAddresses().add(email);
            });
        }
        
        // Update phone numbers
        contact.getPhoneNumbers().clear();
        if (contactDTO.getPhoneNumbers() != null) {
            contactDTO.getPhoneNumbers().forEach(phoneDTO -> {
                PhoneNumber phone = new PhoneNumber();
                phone.setPhone(phoneDTO.getPhone());
                phone.setLabel(phoneDTO.getLabel());
                phone.setContact(contact);
                contact.getPhoneNumbers().add(phone);
            });
        }
        
        Contact updatedContact = contactRepository.save(contact);
        logger.info("Contact updated successfully");
        
        return convertToDTO(updatedContact);
    }
    
    @SuppressWarnings("null")
    @Transactional
    public void deleteContact(Long contactId) {
        logger.info("Deleting contact ID: {}", contactId);
        
        User user = securityUtils.getCurrentUser();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND));
        
        if (!contact.getUser().getId().equals(user.getId())) {
            throw new CustomException("Access denied");
        }
        
        contactRepository.delete(contact);
        logger.info("Contact deleted successfully");
    }
    
    @SuppressWarnings("null")
    @Transactional
    public ContactDTO toggleFavorite(Long contactId) {
        logger.info("Toggling favorite for contact ID: {}", contactId);
        
        User user = securityUtils.getCurrentUser();
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND));
        
        if (!contact.getUser().getId().equals(user.getId())) {
            throw new CustomException("Access denied");
        }
        
        // Handle null isFavorite by treating it as false
        Boolean currentFavorite = contact.getIsFavorite() != null && contact.getIsFavorite();
        contact.setIsFavorite(!currentFavorite);
        Contact updatedContact = contactRepository.save(contact);
        logger.info("Contact favorite status updated to: {}", updatedContact.getIsFavorite());
        
        return convertToDTO(updatedContact);
    }
    
    private ContactDTO convertToDTO(Contact contact) {
        ContactDTO dto = new ContactDTO();
        dto.setId(contact.getId());
        dto.setFirstName(contact.getFirstName());
        dto.setLastName(contact.getLastName());
        dto.setTitle(contact.getTitle());
        dto.setProfileImage(contact.getProfileImage());
        dto.setTags(contact.getTags());
        dto.setIsFavorite(contact.getIsFavorite() != null && contact.getIsFavorite());
        
        dto.setEmailAddresses(contact.getEmailAddresses().stream()
                .map(email -> {
                    EmailDTO emailDTO = new EmailDTO();
                    emailDTO.setId(email.getId());
                    emailDTO.setEmail(email.getEmail());
                    emailDTO.setLabel(email.getLabel());
                    return emailDTO;
                }).toList());
        
        dto.setPhoneNumbers(contact.getPhoneNumbers().stream()
                .map(phone -> {
                    PhoneDTO phoneDTO = new PhoneDTO();
                    phoneDTO.setId(phone.getId());
                    phoneDTO.setPhone(phone.getPhone());
                    phoneDTO.setLabel(phone.getLabel());
                    return phoneDTO;
                }).toList());
        
        return dto;
    }
}