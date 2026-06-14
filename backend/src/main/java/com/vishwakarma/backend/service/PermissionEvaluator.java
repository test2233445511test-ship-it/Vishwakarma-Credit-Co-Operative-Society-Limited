package com.vishwakarma.backend.service;

import com.vishwakarma.backend.model.Permission;
import com.vishwakarma.backend.model.Role;
import com.vishwakarma.backend.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PermissionEvaluator {

    private final RoleRepository roleRepository;

    public PermissionEvaluator(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public boolean hasPermission(Role role, String requiredPermission) {
        if (role == null || role.getPermissions() == null) return false;
        return role.getPermissions().stream()
                .anyMatch(p -> p.getName().equals(requiredPermission));
    }

    public boolean hasAllPermissions(Role role, String... permissions) {
        if (role == null || role.getPermissions() == null) return false;
        Set<String> userPerms = role.getPermissions().stream()
                .map(Permission::getName)
                .collect(Collectors.toSet());
        for (String p : permissions) {
            if (!userPerms.contains(p)) return false;
        }
        return true;
    }

    public boolean hasAnyPermission(Role role, String... permissions) {
        if (role == null || role.getPermissions() == null) return false;
        Set<String> userPerms = role.getPermissions().stream()
                .map(Permission::getName)
                .collect(Collectors.toSet());
        for (String p : permissions) {
            if (userPerms.contains(p)) return true;
        }
        return false;
    }

    public Role getRoleByName(String roleName) {
        return roleRepository.findByName(roleName).orElse(null);
    }
}
