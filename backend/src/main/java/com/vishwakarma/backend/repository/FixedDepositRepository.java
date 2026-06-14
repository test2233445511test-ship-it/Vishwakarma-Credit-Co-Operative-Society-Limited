package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.FixedDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Long> {
    List<FixedDeposit> findByUserId(Long userId);
}
