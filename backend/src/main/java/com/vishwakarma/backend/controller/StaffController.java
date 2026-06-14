package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.ServiceRequest;
import com.vishwakarma.backend.repository.ServiceRequestRepository;
import com.vishwakarma.backend.security.ClerkUserDetails;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final ServiceRequestRepository requestRepository;

    public StaffController(ServiceRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ClerkUserDetails user) {
            return user.getId();
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping("/requests")
    @RequirePermission("request.view")
    public ResponseEntity<List<ServiceRequest>> getAssignedRequests() {
        String staffId = getCurrentUserId();
        return ResponseEntity.ok(requestRepository.findByAssignedToOrderByCreatedAtDesc(staffId));
    }

    @GetMapping("/requests/{id}")
    @RequirePermission("request.view")
    public ResponseEntity<?> getRequestDetail(@PathVariable Long id) {
        var opt = requestRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        ServiceRequest req = opt.get();
        String staffId = getCurrentUserId();
        if (!staffId.equals(req.getAssignedTo())) {
            return ResponseEntity.status(403).body("Not assigned to you");
        }
        return ResponseEntity.ok(req);
    }

    @PutMapping("/requests/{id}/status")
    @RequirePermission("request.approve")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var opt = requestRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        ServiceRequest req = opt.get();
        String staffId = getCurrentUserId();
        if (!staffId.equals(req.getAssignedTo())) {
            return ResponseEntity.status(403).body("Not assigned to you");
        }

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body("Status is required");
        }
        req.setStatus(newStatus);
        requestRepository.save(req);
        return ResponseEntity.ok(req);
    }

    @PutMapping("/requests/{id}/notes")
    @RequirePermission("request.approve")
    public ResponseEntity<?> updateStaffNotes(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var opt = requestRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        ServiceRequest req = opt.get();
        String staffId = getCurrentUserId();
        if (!staffId.equals(req.getAssignedTo())) {
            return ResponseEntity.status(403).body("Not assigned to you");
        }

        req.setStaffNotes(body.get("staffNotes"));
        requestRepository.save(req);
        return ResponseEntity.ok(req);
    }
}
