package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByClerkUserId(String clerkUserId);
    void deleteByClerkUserId(String clerkUserId);
    List<UserSession> findAllByOrderByCreatedAtDesc();
    long countByExpiresAtAfter(LocalDateTime after);
}
