package com.vishwakarma.backend.repository;

import com.vishwakarma.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserIdOrderByUploadedAtDesc(String userId);
    List<Document> findByRequestIdOrderByUploadedAtDesc(Long requestId);
}
