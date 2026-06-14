package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.*;
import com.vishwakarma.backend.repository.*;
import com.vishwakarma.backend.security.annotation.AuditLog;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserSessionRepository sessionRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final UserRepository userRepository;

    public SuperAdminController(RoleRepository roleRepository, PermissionRepository permissionRepository,
                                UserSessionRepository sessionRepository, LoginAttemptRepository loginAttemptRepository,
                                UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.sessionRepository = sessionRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.userRepository = userRepository;
    }

    // ============ ROLE MANAGEMENT ============

    @GetMapping("/roles")
    @RequirePermission("user.manage")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @GetMapping("/permissions")
    @RequirePermission("user.manage")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(permissionRepository.findAll());
    }

    @PutMapping("/roles/{id}")
    @RequirePermission("user.manage")
    @AuditLog(action = "UPDATE_ROLE_PERMISSIONS", resource = "ROLE")
    public ResponseEntity<?> updateRolePermissions(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        var opt = roleRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Role role = opt.get();
        @SuppressWarnings("unchecked")
        List<Integer> permIds = (List<Integer>) body.get("permissionIds");
        if (permIds != null) {
            Set<Permission> permissions = permIds.stream()
                    .map(pid -> permissionRepository.findById(pid.longValue()))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toSet());
            role.setPermissions(permissions);
        }
        if (body.containsKey("description")) {
            role.setDescription((String) body.get("description"));
        }

        roleRepository.save(role);
        return ResponseEntity.ok(role);
    }

    // ============ SESSION MANAGEMENT ============

    @GetMapping("/sessions")
    @RequirePermission("audit.view")
    public ResponseEntity<List<UserSession>> getActiveSessions() {
        return ResponseEntity.ok(sessionRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/sessions/stats")
    @RequirePermission("audit.view")
    public ResponseEntity<Map<String, Object>> getSessionStats() {
        List<UserSession> all = sessionRepository.findAll();
        long activeNow = all.stream().filter(s -> s.getExpiresAt().isAfter(LocalDateTime.now())).count();
        long uniqueIps = all.stream().map(UserSession::getIp).filter(Objects::nonNull).distinct().count();
        long uniqueUsers = all.stream().map(UserSession::getClerkUserId).distinct().count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSessions", (long) all.size());
        stats.put("activeNow", activeNow);
        stats.put("uniqueIps", uniqueIps);
        stats.put("uniqueUsers", uniqueUsers);
        return ResponseEntity.ok(stats);
    }

    // ============ LOGIN ATTEMPTS / SECURITY ============

    @GetMapping("/login-attempts")
    @RequirePermission("audit.view")
    public ResponseEntity<List<LoginAttempt>> getLoginAttempts() {
        return ResponseEntity.ok(loginAttemptRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/login-attempts/stats")
    @RequirePermission("audit.view")
    public ResponseEntity<Map<String, Object>> getLoginStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime hourAgo = LocalDateTime.now().minusHours(1);

        long todayTotal = loginAttemptRepository.countByTimestampAfter(todayStart);
        long todayFailed = loginAttemptRepository.countBySuccessAndTimestampAfter(false, todayStart);
        long todaySuccess = todayTotal - todayFailed;
        long recentAttempts = loginAttemptRepository.countByTimestampAfter(hourAgo);
        long recentFailed = loginAttemptRepository.countBySuccessAndTimestampAfter(false, hourAgo);

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayTotal", todayTotal);
        stats.put("todayFailed", todayFailed);
        stats.put("todaySuccess", todaySuccess);
        stats.put("recentAttempts", recentAttempts);
        stats.put("recentFailed", recentFailed);
        return ResponseEntity.ok(stats);
    }

    // ============ SYSTEM HEALTH ============

    @GetMapping("/system/health")
    @RequirePermission("report.view")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("totalUsers", userRepository.count());

        long activeUsers = userRepository.findAll().stream().filter(User::isAccountActive).count();
        health.put("activeUsers", activeUsers);

        Map<String, Object> db = new HashMap<>();
        db.put("status", "UP");
        db.put("type", "H2");
        health.put("database", db);

        return ResponseEntity.ok(health);
    }
}
