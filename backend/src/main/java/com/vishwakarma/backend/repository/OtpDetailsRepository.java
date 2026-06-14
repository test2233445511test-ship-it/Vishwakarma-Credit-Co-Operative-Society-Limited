package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.OtpDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpDetailsRepository extends JpaRepository<OtpDetails, Long> {
    Optional<OtpDetails> findTopByAccountNumberAndMobileNumberOrderByExpirationTimeDesc(String accountNumber, String mobileNumber);
}
