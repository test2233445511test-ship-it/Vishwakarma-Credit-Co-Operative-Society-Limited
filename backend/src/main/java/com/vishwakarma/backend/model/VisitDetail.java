package com.vishwakarma.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_details")
public class VisitDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String page;

    private String ip;

    @Column(length = 500)
    private String userAgent;

    private String referrer;

    @Column(nullable = false)
    private LocalDateTime visitedAt;

    @PrePersist
    protected void onCreate() {
        if (visitedAt == null) visitedAt = LocalDateTime.now();
    }

    public VisitDetail() {}

    public VisitDetail(String page, String ip, String userAgent, String referrer) {
        this.page = page;
        this.ip = ip;
        this.userAgent = userAgent;
        this.referrer = referrer;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPage() { return page; }
    public void setPage(String page) { this.page = page; }
    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public String getReferrer() { return referrer; }
    public void setReferrer(String referrer) { this.referrer = referrer; }
    public LocalDateTime getVisitedAt() { return visitedAt; }
    public void setVisitedAt(LocalDateTime visitedAt) { this.visitedAt = visitedAt; }
}
