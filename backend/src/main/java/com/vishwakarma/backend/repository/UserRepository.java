package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByAccountNumberAndPhone(String accountNumber, String phone);
    Optional<User> findByAccountNumber(String accountNumber);
}
