package com.vishwakarma.backend.security.aspect;

import com.vishwakarma.backend.security.ClerkUserDetails;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import com.vishwakarma.backend.service.PermissionEvaluator;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PermissionAspect {

    private final PermissionEvaluator permissionEvaluator;

    public PermissionAspect(PermissionEvaluator permissionEvaluator) {
        this.permissionEvaluator = permissionEvaluator;
    }

    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) throws Throwable {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof ClerkUserDetails user)) {
            throw new SecurityException("Authentication required");
        }

        String roleName = user.getRole();
        var role = permissionEvaluator.getRoleByName(roleName);
        if (role == null) {
            throw new SecurityException("Role not found: " + roleName);
        }

        String[] required = requirePermission.value();
        boolean hasAccess;

        if (requirePermission.logical() == RequirePermission.Logical.AND) {
            hasAccess = permissionEvaluator.hasAllPermissions(role, required);
        } else {
            hasAccess = permissionEvaluator.hasAnyPermission(role, required);
        }

        if (!hasAccess) {
            throw new SecurityException("Access denied. Required permissions: " + String.join(", ", required));
        }

        return joinPoint.proceed();
    }
}
