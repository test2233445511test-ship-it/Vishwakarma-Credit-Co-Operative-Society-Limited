package com.vishwakarma.backend.service;

import com.vishwakarma.backend.model.LoginAttempt;
import com.vishwakarma.backend.repository.LoginAttemptRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AccountLockoutService {

    private final LoginAttemptRepository loginAttemptRepository;
    private final int maxFailedAttempts;
    private final long lockoutDurationMinutes;

    private final Map<String, Integer> failureCache = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lockoutCache = new ConcurrentHashMap<>();

    public AccountLockoutService(LoginAttemptRepository loginAttemptRepository,
                                 @Value("${account.lockout.max-attempts:5}") int maxFailedAttempts,
                                 @Value("${account.lockout.duration-minutes:15}") long lockoutDurationMinutes) {
        this.loginAttemptRepository = loginAttemptRepository;
        this.maxFailedAttempts = maxFailedAttempts;
        this.lockoutDurationMinutes = lockoutDurationMinutes;
    }

    public void recordFailedAttempt(String email, String ip) {
        LoginAttempt attempt = new LoginAttempt(email, ip, false);
        loginAttemptRepository.save(attempt);

        int failures = failureCache.merge(email, 1, Integer::sum);
        if (failures >= maxFailedAttempts) {
            lockoutCache.put(email, LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
        }
    }

    public void recordSuccessfulAttempt(String email, String ip) {
        LoginAttempt attempt = new LoginAttempt(email, ip, true);
        loginAttemptRepository.save(attempt);
        failureCache.remove(email);
        lockoutCache.remove(email);
    }

    public boolean isLockedOut(String email) {
        LocalDateTime lockedUntil = lockoutCache.get(email);
        if (lockedUntil == null) return false;
        if (LocalDateTime.now().isAfter(lockedUntil)) {
            lockoutCache.remove(email);
            failureCache.remove(email);
            return false;
        }
        return true;
    }

    public long getLockoutRemainingMinutes(String email) {
        LocalDateTime lockedUntil = lockoutCache.get(email);
        if (lockedUntil == null) return 0;
        long remaining = java.time.Duration.between(LocalDateTime.now(), lockedUntil).toMinutes();
        return Math.max(0, remaining);
    }

    public int getRecentFailedCount(String email) {
        LocalDateTime since = LocalDateTime.now().minusHours(1);
        return (int) loginAttemptRepository.countByEmailAndSuccessAndTimestampAfter(email, false, since);
    }
}
