package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.Document;
import com.vishwakarma.backend.repository.DocumentRepository;
import com.vishwakarma.backend.security.ClerkUserDetails;
import com.vishwakarma.backend.security.annotation.AuditLog;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import com.vishwakarma.backend.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;

    public DocumentController(DocumentRepository documentRepository, FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ClerkUserDetails user) {
            return user.getId();
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping
    @RequirePermission("account.view")
    public ResponseEntity<List<Document>> getMyDocuments() {
        return ResponseEntity.ok(documentRepository.findByUserIdOrderByUploadedAtDesc(getCurrentUserId()));
    }

    @PostMapping("/upload")
    @RequirePermission("request.create")
    @AuditLog(action = "UPLOAD_DOCUMENT", resource = "DOCUMENT")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "requestId", required = false) Long requestId) {
        try {
            String storedName = fileStorageService.storeFile(file);
            Document doc = new Document(
                    getCurrentUserId(),
                    requestId,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    storedName
            );
            Document saved = documentRepository.save(doc);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/download/{id}")
    @RequirePermission("account.view")
    public ResponseEntity<?> downloadFile(@PathVariable Long id) {
        var opt = documentRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Document doc = opt.get();
        Resource resource = fileStorageService.loadFile(doc.getFilePath());

        String contentType = doc.getFileType() != null ? doc.getFileType() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }
}
