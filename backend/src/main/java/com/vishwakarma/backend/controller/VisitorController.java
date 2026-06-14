package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.VisitDetail;
import com.vishwakarma.backend.repository.VisitDetailRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/visitor")
public class VisitorController {

    private final VisitDetailRepository visitDetailRepository;

    public VisitorController(VisitDetailRepository visitDetailRepository) {
        this.visitDetailRepository = visitDetailRepository;
    }

    @PostMapping("/track")
    public ResponseEntity<?> track(HttpServletRequest request, @RequestBody(required = false) Map<String, String> body) {
        String page = body != null ? body.getOrDefault("page", "/") : "/";
        String referrer = body != null ? body.getOrDefault("referrer", "") : "";
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        VisitDetail detail = new VisitDetail(page, ip, userAgent, referrer);
        visitDetailRepository.save(detail);

        long todayCount = visitDetailRepository.countByVisitedAtBetween(
                LocalDateTime.of(LocalDate.now(), LocalTime.MIN),
                LocalDateTime.of(LocalDate.now(), LocalTime.MAX));

        return ResponseEntity.ok(Map.of("count", todayCount));
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayStats() {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        long total = visitDetailRepository.countByVisitedAtBetween(start, end);
        long unique = visitDetailRepository.countDistinctIpByVisitedAtBetween(start, end);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("unique", unique);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/details")
    public ResponseEntity<?> getTodayDetails() {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<VisitDetail> visits = visitDetailRepository.findAll().stream()
                .filter(v -> v.getVisitedAt() != null && v.getVisitedAt().isAfter(start) && v.getVisitedAt().isBefore(end))
                .sorted((a, b) -> b.getVisitedAt().compareTo(a.getVisitedAt()))
                .limit(50)
                .collect(Collectors.toList());

        return ResponseEntity.ok(visits);
    }
}
