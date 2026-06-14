package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.ServiceRequest;
import com.vishwakarma.backend.repository.ServiceRequestRepository;
import com.vishwakarma.backend.security.ClerkUserDetails;
import com.vishwakarma.backend.security.annotation.AuditLog;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class CustomerRequestController {

    private final ServiceRequestRepository repository;

    public CustomerRequestController(ServiceRequestRepository repository) {
        this.repository = repository;
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ClerkUserDetails user) {
            return user.getId();
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping
    @RequirePermission("request.view")
    public ResponseEntity<List<ServiceRequest>> getMyRequests() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(repository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/all")
    @RequirePermission(value = {"request.view", "request.manage"}, logical = RequirePermission.Logical.AND)
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    @RequirePermission("request.view")
    public ResponseEntity<?> getRequest(@PathVariable Long id) {
        var req = repository.findById(id);
        if (req.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(req.get());
    }

    @PostMapping
    @RequirePermission("request.create")
    @AuditLog(action = "CREATE_REQUEST", resource = "SERVICE_REQUEST")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, String> body) {
        String type = body.get("type");
        String description = body.get("description");

        if (type == null || type.isBlank()) {
            return ResponseEntity.badRequest().body("Type is required");
        }
        if (description == null || description.isBlank()) {
            return ResponseEntity.badRequest().body("Description is required");
        }

        ServiceRequest request = new ServiceRequest(getCurrentUserId(), type, description);
        ServiceRequest saved = repository.save(request);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @RequirePermission("request.approve")
    @AuditLog(action = "UPDATE_REQUEST_STATUS", resource = "SERVICE_REQUEST")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var opt = repository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        ServiceRequest req = opt.get();
        String newStatus = body.get("status");
        if (newStatus != null) req.setStatus(newStatus);
        req.setAssignedTo(body.get("assignedTo"));

        repository.save(req);
        return ResponseEntity.ok(req);
    }
}
