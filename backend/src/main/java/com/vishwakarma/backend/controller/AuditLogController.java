package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.AuditLog;
import com.vishwakarma.backend.repository.AuditLogRepository;
import com.vishwakarma.backend.security.ClerkUserDetails;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @RequirePermission("audit.view")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<AuditLog>> getMyLogs() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ClerkUserDetails user) {
            return ResponseEntity.ok(auditLogRepository.findByUserIdOrderByTimestampDesc(user.getId()));
        }
        return ResponseEntity.ok(List.of());
    }
}
