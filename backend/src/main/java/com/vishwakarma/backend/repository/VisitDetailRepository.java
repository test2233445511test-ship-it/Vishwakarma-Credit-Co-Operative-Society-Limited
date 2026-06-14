package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.VisitDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface VisitDetailRepository extends JpaRepository<VisitDetail, Long> {

    long countByVisitedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT v.ip) FROM VisitDetail v WHERE v.visitedAt BETWEEN ?1 AND ?2")
    long countDistinctIpByVisitedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT v.page, COUNT(v) FROM VisitDetail v WHERE v.visitedAt BETWEEN ?1 AND ?2 GROUP BY v.page ORDER BY COUNT(v) DESC")
    java.util.List<Object[]> countByPageBetween(LocalDateTime start, LocalDateTime end);
}
