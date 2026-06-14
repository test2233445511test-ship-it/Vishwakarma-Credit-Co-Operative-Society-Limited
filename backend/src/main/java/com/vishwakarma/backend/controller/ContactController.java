package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.ContactMessage;
import com.vishwakarma.backend.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactMessageRepository repository;

    @PostMapping
    public ResponseEntity<?> submitContactMessage(@RequestBody ContactMessage message) {
        try {
            ContactMessage savedMessage = repository.save(message);
            return ResponseEntity.ok().body("{\"message\": \"Contact message saved successfully\", \"id\": " + savedMessage.getId() + "}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error saving message\"}");
        }
    }
}
