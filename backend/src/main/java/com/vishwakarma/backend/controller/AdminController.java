package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.Role;
import com.vishwakarma.backend.model.ServiceRequest;
import com.vishwakarma.backend.model.User;
import com.vishwakarma.backend.repository.RoleRepository;
import com.vishwakarma.backend.repository.ServiceRequestRepository;
import com.vishwakarma.backend.repository.UserRepository;
import com.vishwakarma.backend.security.annotation.AuditLog;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ServiceRequestRepository requestRepository;

    public AdminController(UserRepository userRepository, RoleRepository roleRepository,
                           ServiceRequestRepository requestRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.requestRepository = requestRepository;
    }

    // ============ USER MANAGEMENT ============

    @GetMapping("/users")
    @RequirePermission("user.view")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    @RequirePermission("user.view")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/role")
    @RequirePermission("user.manage")
    @AuditLog(action = "UPDATE_USER_ROLE", resource = "USER")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        String roleName = body.get("role");
        Role role = roleRepository.findByName(roleName).orElse(null);
        if (role == null) return ResponseEntity.badRequest().body("Invalid role: " + roleName);

        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/status")
    @RequirePermission("user.manage")
    @AuditLog(action = "UPDATE_USER_STATUS", resource = "USER")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        var userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        user.setAccountActive(body.getOrDefault("active", user.isAccountActive()));
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/pending")
    @RequirePermission("request.view")
    public ResponseEntity<List<User>> getPendingApplications() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> "PENDING".equals(u.getApplicationStatus()))
                .toList());
    }

    // ============ REQUEST MANAGEMENT ============

    @GetMapping("/requests")
    @RequirePermission("request.view")
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        return ResponseEntity.ok(requestRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/requests/pending")
    @RequirePermission("request.view")
    public ResponseEntity<List<ServiceRequest>> getPendingRequests() {
        return ResponseEntity.ok(requestRepository.findByStatusOrderByCreatedAtDesc("PENDING"));
    }

    @PutMapping("/requests/{id}/status")
    @RequirePermission("request.approve")
    @AuditLog(action = "UPDATE_REQUEST_STATUS", resource = "SERVICE_REQUEST")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var opt = requestRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        ServiceRequest req = opt.get();
        String status = body.get("status");
        if (status != null) req.setStatus(status);
        String assignedTo = body.get("assignedTo");
        if (assignedTo != null) req.setAssignedTo(assignedTo);

        requestRepository.save(req);
        return ResponseEntity.ok(req);
    }
}
