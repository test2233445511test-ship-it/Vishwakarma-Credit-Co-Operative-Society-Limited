package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    List<LoginAttempt> findByEmailOrderByTimestampDesc(String email);
    long countByEmailAndSuccessAndTimestampAfter(String email, boolean success, LocalDateTime after);
    List<LoginAttempt> findAllByOrderByTimestampDesc();
    long countBySuccessAndTimestampAfter(boolean success, LocalDateTime after);
    long countByTimestampAfter(LocalDateTime after);
}
