package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.ContactDTO;
import com.contactmanagement.backend.dto.EmailDTO;
import com.contactmanagement.backend.dto.PhoneDTO;
import com.contactmanagement.backend.entity.*;
import com.contactmanagement.backend.exception.CustomException;
import com.contactmanagement.backend.exception.ResourceNotFoundException;
import com.contactmanagement.backend.repository.ContactRepository;
import com.contactmanagement.backend.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ContactService
 * 
 * These tests verify contact management business logic without starting Spring context.
 * All dependencies are mocked using Mockito.
 * Tests follow the Arrange-Act-Assert pattern.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ContactService Unit Tests")
@SuppressWarnings("null") // Mockito type conversions - safe in test context
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private ContactService contactService;

    private User testUser;
    private Contact testContact;
    private ContactDTO contactDTO;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        // Arrange - Create test data used by multiple tests
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("user@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");

        testContact = new Contact();
        testContact.setId(1L);
        testContact.setUser(testUser);
        testContact.setFirstName("John");
        testContact.setLastName("Doe");
        testContact.setTitle("Software Engineer");
        testContact.setProfileImage("profile.jpg");
        testContact.setTags(Arrays.asList("work", "important"));
        testContact.setIsFavorite(false);
        testContact.setEmailAddresses(new ArrayList<>());
        testContact.setPhoneNumbers(new ArrayList<>());

        // Add email addresses
        EmailAddress email = new EmailAddress();
        email.setId(1L);
        email.setEmail("john@example.com");
        email.setLabel("work");
        email.setContact(testContact);
        testContact.getEmailAddresses().add(email);

        // Add phone numbers
        PhoneNumber phone = new PhoneNumber();
        phone.setId(1L);
        phone.setPhone("+1234567890");
        phone.setLabel("mobile");
        phone.setContact(testContact);
        testContact.getPhoneNumbers().add(phone);

        contactDTO = new ContactDTO();
        contactDTO.setFirstName("Jane");
        contactDTO.setLastName("Smith");
        contactDTO.setTitle("Product Manager");
        contactDTO.setTags(Arrays.asList("friend"));
        contactDTO.setIsFavorite(true);
        
        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setEmail("jane@example.com");
        emailDTO.setLabel("personal");
        contactDTO.setEmailAddresses(Arrays.asList(emailDTO));
        
        PhoneDTO phoneDTO = new PhoneDTO();
        phoneDTO.setPhone("+9876543210");
        phoneDTO.setLabel("home");
        contactDTO.setPhoneNumbers(Arrays.asList(phoneDTO));

        pageable = PageRequest.of(0, 10);
    }

    // ===== Get All Contacts Tests =====

    @Test
    @DisplayName("Should successfully get all contacts for current user")
    void getAllContacts_ShouldReturnUserContacts() {
        // Arrange
        List<Contact> contacts = Arrays.asList(testContact);
        Page<Contact> contactPage = new PageImpl<>(contacts, pageable, 1);
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findByUserId(testUser.getId(), pageable)).thenReturn(contactPage);

        // Act
        Page<ContactDTO> result = contactService.getAllContacts(pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFirstName()).isEqualTo("John");
        assertThat(result.getContent().get(0).getLastName()).isEqualTo("Doe");
        verify(securityUtils).getCurrentUser();
        verify(contactRepository).findByUserId(testUser.getId(), pageable);
    }

    @Test
    @DisplayName("Should return empty page when user has no contacts")
    void getAllContacts_WithNoContacts_ShouldReturnEmptyPage() {
        // Arrange
        Page<Contact> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findByUserId(testUser.getId(), pageable)).thenReturn(emptyPage);

        // Act
        Page<ContactDTO> result = contactService.getAllContacts(pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
        verify(contactRepository).findByUserId(testUser.getId(), pageable);
    }

    // ===== Search Contacts Tests =====

    @Test
    @DisplayName("Should successfully search contacts by query")
    void searchContacts_WithQuery_ShouldReturnMatchingContacts() {
        // Arrange
        String searchQuery = "John";
        List<Contact> contacts = Arrays.asList(testContact);
        Page<Contact> contactPage = new PageImpl<>(contacts, pageable, 1);
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.searchContacts(testUser.getId(), searchQuery, pageable))
                .thenReturn(contactPage);

        // Act
        Page<ContactDTO> result = contactService.searchContacts(searchQuery, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFirstName()).isEqualTo("John");
        verify(contactRepository).searchContacts(testUser.getId(), searchQuery, pageable);
    }

    // ===== Get Contact By ID Tests =====

    @Test
    @DisplayName("Should successfully get contact by ID when user owns it")
    void getContactById_WhenUserOwnsContact_ShouldReturnContact() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        // Act
        ContactDTO result = contactService.getContactById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getEmailAddresses()).hasSize(1);
        assertThat(result.getPhoneNumbers()).hasSize(1);
        verify(securityUtils).getCurrentUser();
        verify(contactRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when contact not found")
    void getContactById_WhenContactNotFound_ShouldThrowException() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> contactService.getContactById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Contact not found");
        
        verify(contactRepository).findById(999L);
    }

    @Test
    @DisplayName("Should throw exception when user does not own contact")
    void getContactById_WhenUserDoesNotOwnContact_ShouldThrowException() {
        // Arrange
        User differentUser = new User();
        differentUser.setId(2L);
        differentUser.setEmail("other@example.com");
        
        when(securityUtils.getCurrentUser()).thenReturn(differentUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        // Act & Assert
        assertThatThrownBy(() -> contactService.getContactById(1L))
                .isInstanceOf(CustomException.class)
                .hasMessage("Access denied");
        
        verify(securityUtils).getCurrentUser();
        verify(contactRepository).findById(1L);
    }

    // ===== Create Contact Tests =====

    @Test
    @DisplayName("Should successfully create contact with all fields")
    void createContact_WithAllFields_ShouldSucceed() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.save(any(Contact.class))).thenAnswer(invocation -> {
            Contact savedContact = invocation.getArgument(0);
            savedContact.setId(2L);
            return savedContact;
        });

        // Act
        ContactDTO result = contactService.createContact(contactDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getFirstName()).isEqualTo("Jane");
        assertThat(result.getLastName()).isEqualTo("Smith");
        assertThat(result.getTitle()).isEqualTo("Product Manager");
        assertThat(result.getEmailAddresses()).hasSize(1);
        assertThat(result.getPhoneNumbers()).hasSize(1);
        assertThat(result.getTags()).containsExactly("friend");
        assertThat(result.getIsFavorite()).isTrue();
        
        verify(securityUtils).getCurrentUser();
        verify(contactRepository).save(any(Contact.class));
    }

    @Test
    @DisplayName("Should create contact with default values for optional fields")
    void createContact_WithMinimalData_ShouldSetDefaults() {
        // Arrange
        ContactDTO minimalDTO = new ContactDTO();
        minimalDTO.setFirstName("Min");
        minimalDTO.setLastName("User");
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.save(any(Contact.class))).thenAnswer(invocation -> {
            Contact savedContact = invocation.getArgument(0);
            savedContact.setId(3L);
            return savedContact;
        });

        // Act
        ContactDTO result = contactService.createContact(minimalDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIsFavorite()).isFalse();
        assertThat(result.getTags()).isEmpty();
        verify(contactRepository).save(any(Contact.class));
    }

    // ===== Update Contact Tests =====

    @Test
    @DisplayName("Should successfully update contact when user owns it")
    void updateContact_WhenUserOwnsContact_ShouldSucceed() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        // Act
        ContactDTO result = contactService.updateContact(1L, contactDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("Jane");
        assertThat(result.getLastName()).isEqualTo("Smith");
        verify(securityUtils).getCurrentUser();
        verify(contactRepository).findById(1L);
        verify(contactRepository).save(testContact);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent contact")
    void updateContact_WhenContactNotFound_ShouldThrowException() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> contactService.updateContact(999L, contactDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Contact not found");
        
        verify(contactRepository, never()).save(any(Contact.class));
    }

    @Test
    @DisplayName("Should throw exception when updating contact user does not own")
    void updateContact_WhenUserDoesNotOwnContact_ShouldThrowException() {
        // Arrange
        User differentUser = new User();
        differentUser.setId(2L);
        
        when(securityUtils.getCurrentUser()).thenReturn(differentUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        // Act & Assert
        assertThatThrownBy(() -> contactService.updateContact(1L, contactDTO))
                .isInstanceOf(CustomException.class)
                .hasMessage("Access denied");
        
        verify(contactRepository, never()).save(any(Contact.class));
    }

    // ===== Delete Contact Tests =====

    @Test
    @DisplayName("Should successfully delete contact when user owns it")
    void deleteContact_WhenUserOwnsContact_ShouldSucceed() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        // Act
        contactService.deleteContact(1L);

        // Assert
        verify(securityUtils).getCurrentUser();
        verify(contactRepository).findById(1L);
        verify(contactRepository).delete(testContact);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent contact")
    void deleteContact_WhenContactNotFound_ShouldThrowException() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> contactService.deleteContact(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Contact not found");
        
        verify(contactRepository, never()).delete(any(Contact.class));
    }

    @Test
    @DisplayName("Should throw exception when deleting contact user does not own")
    void deleteContact_WhenUserDoesNotOwnContact_ShouldThrowException() {
        // Arrange
        User differentUser = new User();
        differentUser.setId(2L);
        
        when(securityUtils.getCurrentUser()).thenReturn(differentUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        // Act & Assert
        assertThatThrownBy(() -> contactService.deleteContact(1L))
                .isInstanceOf(CustomException.class)
                .hasMessage("Access denied");
        
        verify(contactRepository, never()).delete(any(Contact.class));
    }

    // ===== Toggle Favorite Tests =====

    @Test
    @DisplayName("Should toggle favorite from false to true")
    void toggleFavorite_FromFalseToTrue_ShouldSucceed() {
        // Arrange
        testContact.setIsFavorite(false);
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));
        when(contactRepository.save(testContact)).thenReturn(testContact);

        // Act
        ContactDTO result = contactService.toggleFavorite(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIsFavorite()).isTrue();
        verify(contactRepository).save(testContact);
    }

    @Test
    @DisplayName("Should toggle favorite from true to false")
    void toggleFavorite_FromTrueToFalse_ShouldSucceed() {
        // Arrange
        testContact.setIsFavorite(true);
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));
        when(contactRepository.save(testContact)).thenReturn(testContact);

        // Act
        ContactDTO result = contactService.toggleFavorite(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIsFavorite()).isFalse();
        verify(contactRepository).save(testContact);
    }

    @Test
    @DisplayName("Should handle null favorite status as false")
    void toggleFavorite_WithNullFavorite_ShouldTreatAsFalse() {
        // Arrange
        testContact.setIsFavorite(null);
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));
        when(contactRepository.save(testContact)).thenReturn(testContact);

        // Act
        ContactDTO result = contactService.toggleFavorite(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIsFavorite()).isTrue();
        verify(contactRepository).save(testContact);
    }

    @Test
    @DisplayName("Should throw exception when toggling favorite for contact user does not own")
    void toggleFavorite_WhenUserDoesNotOwnContact_ShouldThrowException() {
        // Arrange
        User differentUser = new User();
        differentUser.setId(2L);
        
        when(securityUtils.getCurrentUser()).thenReturn(differentUser);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        // Act & Assert
        assertThatThrownBy(() -> contactService.toggleFavorite(1L))
                .isInstanceOf(CustomException.class)
                .hasMessage("Access denied");
        
        verify(contactRepository, never()).save(any(Contact.class));
    }
}
