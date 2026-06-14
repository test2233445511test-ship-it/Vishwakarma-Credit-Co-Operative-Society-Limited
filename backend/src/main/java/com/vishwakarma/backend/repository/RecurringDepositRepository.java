package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.RecurringDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecurringDepositRepository extends JpaRepository<RecurringDeposit, Long> {
    List<RecurringDeposit> findByUserId(Long userId);
}
