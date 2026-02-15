package com.contactmanagement.backend.service;

import com.contactmanagement.backend.dto.*;
import com.contactmanagement.backend.entity.User;
import com.contactmanagement.backend.exception.CustomException;
import com.contactmanagement.backend.repository.UserRepository;
import com.contactmanagement.backend.security.JwtUtil;
import com.contactmanagement.backend.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService
 * 
 * These tests verify business logic without starting Spring context.
 * All dependencies are mocked using Mockito.
 * Tests follow the Arrange-Act-Assert pattern.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
@SuppressWarnings("null") // Mockito type conversions - safe in test context
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        // Arrange - Create test data used by multiple tests
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPhoneNumber("+1234567890");
        testUser.setPassword("encodedPassword");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("newuser@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Jane");
        registerRequest.setLastName("Smith");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("test@example.com");
        loginRequest.setPassword("password123");
    }

    // ===== Registration Tests =====

    @Test
    @DisplayName("Should successfully register user with valid email")
    void registerUser_WithValidEmail_ShouldSucceed() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);
            return savedUser;
        });

        // Act
        User result = userService.registerUser(registerRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo(registerRequest.getEmail());
        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully register user with phone number only")
    void registerUser_WithPhoneOnly_ShouldSucceed() {
        // Arrange
        registerRequest.setEmail(null);
        registerRequest.setPhoneNumber("+1234567890");
        when(userRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);
            return savedUser;
        });

        // Act
        User result = userService.registerUser(registerRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPhoneNumber()).isEqualTo(registerRequest.getPhoneNumber());
        verify(userRepository).existsByPhoneNumber(registerRequest.getPhoneNumber());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void registerUser_WithExistingEmail_ShouldThrowException() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.registerUser(registerRequest))
                .isInstanceOf(CustomException.class)
                .hasMessage("Email already registered");
        
        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when phone number already exists")
    void registerUser_WithExistingPhone_ShouldThrowException() {
        // Arrange
        registerRequest.setPhoneNumber("+1234567890");
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.registerUser(registerRequest))
                .isInstanceOf(CustomException.class)
                .hasMessage("Phone number already registered");
        
        verify(userRepository).existsByPhoneNumber(registerRequest.getPhoneNumber());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when neither email nor phone provided")
    void registerUser_WithoutEmailOrPhone_ShouldThrowException() {
        // Arrange
        registerRequest.setEmail(null);
        registerRequest.setPhoneNumber(null);

        // Act & Assert
        assertThatThrownBy(() -> userService.registerUser(registerRequest))
                .isInstanceOf(CustomException.class)
                .hasMessage("Either email or phone number must be provided");
        
        verify(userRepository, never()).save(any(User.class));
    }

    // ===== Login Tests =====

    @Test
    @DisplayName("Should successfully login with email and correct password")
    void login_WithEmailAndCorrectPassword_ShouldSucceed() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getUsername())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(testUser.getEmail())).thenReturn("jwt-token-123");

        // Act
        LoginResponse response = userService.login(loginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        assertThat(response.getMessage()).isEqualTo("Login successful");
        verify(userRepository).findByEmail(loginRequest.getUsername());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
        verify(jwtUtil).generateToken(testUser.getEmail());
    }

    @Test
    @DisplayName("Should successfully login with phone number and correct password")
    void login_WithPhoneAndCorrectPassword_ShouldSucceed() {
        // Arrange
        testUser.setEmail(null);
        loginRequest.setUsername(testUser.getPhoneNumber());
        when(userRepository.findByEmail(loginRequest.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber(loginRequest.getUsername())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(testUser.getPhoneNumber())).thenReturn("jwt-token-456");

        // Act
        LoginResponse response = userService.login(loginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token-456");
        verify(userRepository).findByPhoneNumber(loginRequest.getUsername());
        verify(jwtUtil).generateToken(testUser.getPhoneNumber());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void login_WithNonExistentUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber(loginRequest.getUsername())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.login(loginRequest))
                .isInstanceOf(CustomException.class)
                .hasMessage("Invalid username or password");
        
        verify(userRepository).findByEmail(loginRequest.getUsername());
        verify(userRepository).findByPhoneNumber(loginRequest.getUsername());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    @DisplayName("Should throw exception when password is incorrect")
    void login_WithIncorrectPassword_ShouldThrowException() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getUsername())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> userService.login(loginRequest))
                .isInstanceOf(CustomException.class)
                .hasMessage("Invalid username or password");
        
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
        verify(jwtUtil, never()).generateToken(any());
    }

    // ===== Get Profile Tests =====

    @Test
    @DisplayName("Should successfully get user profile")
    void getUserProfile_ShouldReturnProfile() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);

        // Act
        UserProfileDTO profile = userService.getUserProfile();

        // Assert
        assertThat(profile).isNotNull();
        assertThat(profile.getId()).isEqualTo(testUser.getId());
        assertThat(profile.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(profile.getPhoneNumber()).isEqualTo(testUser.getPhoneNumber());
        assertThat(profile.getFirstName()).isEqualTo(testUser.getFirstName());
        assertThat(profile.getLastName()).isEqualTo(testUser.getLastName());
        verify(securityUtils).getCurrentUser();
    }

    // ===== Change Password Tests =====

    @Test
    @DisplayName("Should successfully change password with correct current password")
    void changePassword_WithCorrectCurrentPassword_ShouldSucceed() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword123");
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(passwordEncoder.matches(request.getCurrentPassword(), testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("encodedNewPassword");
        when(userRepository.save(testUser)).thenReturn(testUser);

        // Act
        userService.changePassword(request);

        // Assert
        verify(securityUtils).getCurrentUser();
        verify(passwordEncoder).matches(anyString(), anyString());
        verify(passwordEncoder).encode(anyString());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when current password is incorrect")
    void changePassword_WithIncorrectCurrentPassword_ShouldThrowException() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword123");
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(passwordEncoder.matches(request.getCurrentPassword(), testUser.getPassword())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> userService.changePassword(request))
                .isInstanceOf(CustomException.class)
                .hasMessage("Current password is incorrect");
        
        verify(passwordEncoder).matches(request.getCurrentPassword(), testUser.getPassword());
        verify(userRepository, never()).save(any(User.class));
    }

    // ===== Update Profile Tests =====

    @Test
    @DisplayName("Should successfully update user profile")
    void updateUserProfile_WithValidData_ShouldSucceed() {
        // Arrange
        UserProfileDTO updateDTO = new UserProfileDTO();
        updateDTO.setFirstName("UpdatedFirst");
        updateDTO.setLastName("UpdatedLast");
        updateDTO.setEmail("updated@example.com");
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(userRepository.existsByEmail(updateDTO.getEmail())).thenReturn(false);
        when(userRepository.save(testUser)).thenReturn(testUser);

        // Act
        UserProfileDTO result = userService.updateUserProfile(updateDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("UpdatedFirst");
        assertThat(result.getLastName()).isEqualTo("UpdatedLast");
        verify(securityUtils).getCurrentUser();
        verify(userRepository).existsByEmail(updateDTO.getEmail());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when updating to existing email")
    void updateUserProfile_WithExistingEmail_ShouldThrowException() {
        // Arrange
        UserProfileDTO updateDTO = new UserProfileDTO();
        updateDTO.setEmail("existing@example.com");
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(userRepository.existsByEmail(updateDTO.getEmail())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.updateUserProfile(updateDTO))
                .isInstanceOf(CustomException.class)
                .hasMessage("Email already in use");
        
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when updating to existing phone number")
    void updateUserProfile_WithExistingPhone_ShouldThrowException() {
        // Arrange
        UserProfileDTO updateDTO = new UserProfileDTO();
        updateDTO.setPhoneNumber("+9999999999");
        
        when(securityUtils.getCurrentUser()).thenReturn(testUser);
        when(userRepository.existsByPhoneNumber(updateDTO.getPhoneNumber())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.updateUserProfile(updateDTO))
                .isInstanceOf(CustomException.class)
                .hasMessage("Phone number already in use");
        
        verify(userRepository, never()).save(any(User.class));
    }

    // ===== Delete Account Tests =====

    @Test
    @DisplayName("Should successfully delete user account")
    void deleteAccount_ShouldSucceed() {
        // Arrange
        when(securityUtils.getCurrentUser()).thenReturn(testUser);

        // Act
        userService.deleteAccount();

        // Assert
        verify(securityUtils).getCurrentUser();
        verify(userRepository).delete(testUser);
    }
}
