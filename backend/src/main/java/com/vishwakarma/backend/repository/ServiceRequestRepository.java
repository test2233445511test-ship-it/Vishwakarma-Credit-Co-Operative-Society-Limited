package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<ServiceRequest> findByAssignedToOrderByCreatedAtDesc(String assignedTo);
    List<ServiceRequest> findByAssignedToAndStatusOrderByCreatedAtDesc(String assignedTo, String status);
    List<ServiceRequest> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
}
