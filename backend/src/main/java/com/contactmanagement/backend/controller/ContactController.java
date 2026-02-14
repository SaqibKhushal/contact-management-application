package com.contactmanagement.backend.controller;

import com.contactmanagement.backend.dto.ContactDTO;
import com.contactmanagement.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for contact management operations.
 * All endpoints require authentication via JWT token.
 */
@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
public class ContactController {
    
    private final ContactService contactService;
    
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }
    
    @GetMapping
    public ResponseEntity<Page<ContactDTO>> getAllContacts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ContactDTO> contacts = contactService.getAllContacts(pageable);
        return ResponseEntity.ok(contacts);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ContactDTO>> searchContacts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ContactDTO> contacts = contactService.searchContacts(query, pageable);
        return ResponseEntity.ok(contacts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ContactDTO> getContactById(@PathVariable Long id) {
        ContactDTO contact = contactService.getContactById(id);
        return ResponseEntity.ok(contact);
    }
    
    @PostMapping
    public ResponseEntity<ContactDTO> createContact(@Valid @RequestBody ContactDTO contactDTO) {
        ContactDTO created = contactService.createContact(contactDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ContactDTO> updateContact(
            @PathVariable Long id,
            @Valid @RequestBody ContactDTO contactDTO) {
        ContactDTO updated = contactService.updateContact(id, contactDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contact deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/favorite")
    public ResponseEntity<ContactDTO> toggleFavorite(@PathVariable Long id) {
        ContactDTO updated = contactService.toggleFavorite(id);
        return ResponseEntity.ok(updated);
    }
}