package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.User;
import com.vishwakarma.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data-entry")
public class DataEntryController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataEntryController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/customer-application")
    public ResponseEntity<?> submitCustomerApplication(@RequestBody User request) {
        if (request.getAadhaarNumber() != null && userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User application = new User();
        application.setName(request.getName());
        application.setEmail(request.getEmail() != null ? request.getEmail() : request.getAadhaarNumber() + "@pending.com");
        application.setPhone(request.getPhone());
        
        // Mock password since it's required by the model
        application.setPassword(passwordEncoder.encode("pending123"));
        
        // Extended Details
        application.setDateOfBirth(request.getDateOfBirth());
        application.setGender(request.getGender());
        application.setAadhaarNumber(request.getAadhaarNumber());
        application.setPanNumber(request.getPanNumber());
        application.setAddress(request.getAddress());
        application.setCity(request.getCity());
        application.setState(request.getState());
        application.setPinCode(request.getPinCode());
        application.setOccupation(request.getOccupation());
        application.setNomineeName(request.getNomineeName());
        application.setNomineeRelationship(request.getNomineeRelationship());
        
        // Needs Manager Approval
        application.setApplicationStatus("PENDING");

        userRepository.save(application);

        return ResponseEntity.ok("Application submitted successfully and is pending Manager approval.");
    }
}
