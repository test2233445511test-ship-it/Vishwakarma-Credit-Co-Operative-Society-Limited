package com.vishwakarma.backend.security.aspect;

import com.vishwakarma.backend.repository.AuditLogRepository;
import com.vishwakarma.backend.security.ClerkUserDetails;
import com.vishwakarma.backend.security.annotation.AuditLog;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    public AuditAspect(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Around("@annotation(auditLog)")
    public Object logAudit(ProceedingJoinPoint joinPoint, AuditLog auditLog) throws Throwable {
        String userId = "anonymous";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ClerkUserDetails user) {
            userId = user.getId();
        }

        String ip = "";
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes sra) {
            HttpServletRequest request = sra.getRequest();
            ip = request.getRemoteAddr();
        }

        String details = String.format("Method: %s, Args: %s",
                joinPoint.getSignature().toShortString(), joinPoint.getArgs());

        com.vishwakarma.backend.model.AuditLog log = new com.vishwakarma.backend.model.AuditLog(userId, auditLog.action(), auditLog.resource(), details, ip);
        auditLogRepository.save(log);

        return joinPoint.proceed();
    }
}
