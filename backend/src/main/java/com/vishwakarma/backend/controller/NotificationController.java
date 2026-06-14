package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.Notification;
import com.vishwakarma.backend.repository.NotificationRepository;
import com.vishwakarma.backend.security.ClerkUserDetails;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repository;

    public NotificationController(NotificationRepository repository) {
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
    @RequirePermission("account.view")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        return ResponseEntity.ok(repository.findByUserIdOrderByCreatedAtDesc(getCurrentUserId()));
    }

    @GetMapping("/unread-count")
    @RequirePermission("account.view")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = repository.countByUserIdAndIsReadFalse(getCurrentUserId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    @RequirePermission("account.view")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        var opt = repository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Notification n = opt.get();
        n.setRead(true);
        repository.save(n);
        return ResponseEntity.ok(n);
    }

    @PutMapping("/read-all")
    @RequirePermission("account.view")
    public ResponseEntity<?> markAllAsRead() {
        List<Notification> unread = repository.findByUserIdOrderByCreatedAtDesc(getCurrentUserId())
                .stream().filter(n -> !n.isRead()).toList();
        for (Notification n : unread) {
            n.setRead(true);
            repository.save(n);
        }
        return ResponseEntity.ok(Map.of("marked", unread.size()));
    }
}
