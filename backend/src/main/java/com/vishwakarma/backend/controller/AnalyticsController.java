package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.ServiceRequest;
import com.vishwakarma.backend.model.User;
import com.vishwakarma.backend.repository.AuditLogRepository;
import com.vishwakarma.backend.repository.ServiceRequestRepository;
import com.vishwakarma.backend.repository.UserRepository;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private final UserRepository userRepository;
    private final ServiceRequestRepository requestRepository;
    private final AuditLogRepository auditLogRepository;

    public AnalyticsController(UserRepository userRepository, ServiceRequestRepository requestRepository,
                               AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/summary")
    @RequirePermission("report.view")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<User> allUsers = userRepository.findAll();
        List<ServiceRequest> allRequests = requestRepository.findAll();

        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(User::isAccountActive).count();
        long pendingApplications = allUsers.stream().filter(u -> "PENDING".equals(u.getApplicationStatus())).count();

        long totalRequests = allRequests.size();
        long pendingRequests = allRequests.stream().filter(r -> "PENDING".equals(r.getStatus())).count();
        long resolvedRequests = allRequests.stream().filter(r -> "RESOLVED".equals(r.getStatus()) || "CLOSED".equals(r.getStatus())).count();

        long usersThisMonth = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(LocalDate.now().withDayOfMonth(1).atStartOfDay()))
                .count();

        long requestsThisMonth = allRequests.stream()
                .filter(r -> r.getCreatedAt().isAfter(LocalDate.now().withDayOfMonth(1).atStartOfDay()))
                .count();

        double approvalRate = totalRequests > 0 ? (resolvedRequests * 100.0 / totalRequests) : 0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUsers", totalUsers);
        summary.put("activeUsers", activeUsers);
        summary.put("pendingApplications", pendingApplications);
        summary.put("totalRequests", totalRequests);
        summary.put("pendingRequests", pendingRequests);
        summary.put("resolvedRequests", resolvedRequests);
        summary.put("usersThisMonth", usersThisMonth);
        summary.put("requestsThisMonth", requestsThisMonth);
        summary.put("approvalRate", Math.round(approvalRate * 10.0) / 10.0);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/request-volume")
    @RequirePermission("report.view")
    public ResponseEntity<List<Map<String, Object>>> getRequestVolume() {
        List<ServiceRequest> requests = requestRepository.findAll();

        Map<LocalDate, Long> dailyCount = requests.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCreatedAt().toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        LocalDate today = LocalDate.now();
        List<Map<String, Object>> volume = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date.toString());
            entry.put("count", dailyCount.getOrDefault(date, 0L));
            volume.add(entry);
        }

        return ResponseEntity.ok(volume);
    }

    @GetMapping("/user-growth")
    @RequirePermission("report.view")
    public ResponseEntity<List<Map<String, Object>>> getUserGrowth() {
        List<User> users = userRepository.findAll();

        Map<LocalDate, Long> dailySignups = users.stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        u -> u.getCreatedAt().toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        LocalDate today = LocalDate.now();
        List<Map<String, Object>> growth = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date.toString());
            entry.put("count", dailySignups.getOrDefault(date, 0L));
            growth.add(entry);
        }

        return ResponseEntity.ok(growth);
    }
}
