package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.User;
import com.vishwakarma.backend.repository.UserRepository;
import com.vishwakarma.backend.security.annotation.AuditLog;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final UserRepository userRepository;

    public ManagerController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/customers")
    @RequirePermission("user.view")
    public ResponseEntity<List<User>> getAllCustomers() {
        // In a real CBS, we would filter by Role "MEMBER" or "CUSTOMER"
        List<User> customers = userRepository.findAll();
        return ResponseEntity.ok(customers);
    }

    @PostMapping("/approve-application/{userId}")
    @RequirePermission("request.approve")
    @AuditLog(action = "APPROVE_APPLICATION", resource = "USER_APPLICATION")
    public ResponseEntity<?> approveApplication(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Application not found");
        }

        User user = userOpt.get();
        if ("APPROVED".equals(user.getApplicationStatus())) {
            return ResponseEntity.badRequest().body("Application already approved");
        }

        user.setApplicationStatus("APPROVED");
        
        // Generate Account Number automatically: Starting from 1000000001
        String generatedAccNumber = "100" + String.format("%07d", user.getId());
        user.setAccountNumber(generatedAccNumber);
        
        userRepository.save(user);

        return ResponseEntity.ok("Application Approved! Account Number Generated: " + generatedAccNumber);
    }

    @PostMapping("/reject-application/{userId}")
    @RequirePermission("request.approve")
    @AuditLog(action = "REJECT_APPLICATION", resource = "USER_APPLICATION")
    public ResponseEntity<?> rejectApplication(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Application not found");
        }

        User user = userOpt.get();
        user.setApplicationStatus("REJECTED");
        userRepository.save(user);

        return ResponseEntity.ok("Application Rejected");
    }
}
