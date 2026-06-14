package com.vishwakarma.backend.config;

import com.vishwakarma.backend.model.Permission;
import com.vishwakarma.backend.model.Role;
import com.vishwakarma.backend.model.User;
import com.vishwakarma.backend.repository.PermissionRepository;
import com.vishwakarma.backend.repository.RoleRepository;
import com.vishwakarma.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository,
                      PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedPermissions();
        seedRoles();
        seedUsers();
    }

    private void seedPermissions() {
        createIfNotExists("user.view", "View user profiles");
        createIfNotExists("user.create", "Create new users");
        createIfNotExists("user.edit", "Edit user profiles");
        createIfNotExists("user.delete", "Delete users");
        createIfNotExists("user.manage", "Full user management");

        createIfNotExists("role.view", "View roles and permissions");
        createIfNotExists("role.manage", "Manage roles and permissions");

        createIfNotExists("request.create", "Create requests");
        createIfNotExists("request.view", "View requests");
        createIfNotExists("request.approve", "Approve or reject requests");
        createIfNotExists("request.assign", "Assign requests to staff");
        createIfNotExists("request.manage", "Full request management");

        createIfNotExists("loan.create", "Apply for loans");
        createIfNotExists("loan.view", "View loan details");
        createIfNotExists("loan.approve", "Approve or reject loans");
        createIfNotExists("loan.manage", "Full loan management");

        createIfNotExists("account.view", "View account details");
        createIfNotExists("account.manage", "Manage accounts");

        createIfNotExists("report.view", "View reports");
        createIfNotExists("report.export", "Export reports");

        createIfNotExists("audit.view", "View audit logs");
        createIfNotExists("settings.manage", "Manage system settings");
    }

    private void createIfNotExists(String name, String description) {
        if (!permissionRepository.existsByName(name)) {
            permissionRepository.save(new Permission(name, description));
        }
    }

    private void seedRoles() {
        Role superAdmin = roleRepository.findByName("SUPER_ADMIN").orElseGet(() -> {
            Role r = new Role("SUPER_ADMIN", "Full system access with all permissions");
            return roleRepository.save(r);
        });

        Role admin = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role r = new Role("ADMIN", "Administrative access with management permissions");
            return roleRepository.save(r);
        });

        Role staff = roleRepository.findByName("STAFF").orElseGet(() -> {
            Role r = new Role("STAFF", "Staff access for assigned tasks");
            return roleRepository.save(r);
        });

        Role member = roleRepository.findByName("MEMBER").orElseGet(() -> {
            Role r = new Role("MEMBER", "Regular member/customer access");
            return roleRepository.save(r);
        });

        Set<Permission> allPermissions = new HashSet<>(permissionRepository.findAll());

        Set<Permission> adminPermissions = new HashSet<>();
        for (Permission p : allPermissions) {
            if (!p.getName().equals("settings.manage") && !p.getName().startsWith("role.")) {
                adminPermissions.add(p);
            }
        }

        Set<Permission> staffPermissions = new HashSet<>();
        for (Permission p : allPermissions) {
            if (p.getName().equals("request.view") || p.getName().equals("request.approve") ||
                p.getName().equals("loan.view") || p.getName().equals("account.view") ||
                p.getName().equals("user.view")) {
                staffPermissions.add(p);
            }
        }

        Set<Permission> memberPermissions = new HashSet<>();
        for (Permission p : allPermissions) {
            if (p.getName().equals("request.create") || p.getName().equals("request.view") ||
                p.getName().equals("loan.create") || p.getName().equals("loan.view") ||
                p.getName().equals("account.view")) {
                memberPermissions.add(p);
            }
        }

        superAdmin.setPermissions(allPermissions);
        roleRepository.save(superAdmin);

        admin.setPermissions(adminPermissions);
        roleRepository.save(admin);

        staff.setPermissions(staffPermissions);
        roleRepository.save(staff);

        member.setPermissions(memberPermissions);
        roleRepository.save(member);
    }

    private void seedUsers() {
        Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseThrow(() -> new RuntimeException("SUPER_ADMIN role not found"));
        Role memberRole = roleRepository.findByName("MEMBER")
                .orElseThrow(() -> new RuntimeException("MEMBER role not found"));

        if (!userRepository.existsByEmail("superadmin@vishwakarma.com")) {
            User superAdmin = new User("Super Admin", "superadmin@vishwakarma.com", "8192456364",
                    passwordEncoder.encode("admin123"));
            superAdmin.setRole(superAdminRole);
            userRepository.save(superAdmin);
        }

        if (!userRepository.existsByEmail("staff@vishwakarma.com")) {
            Role staffRole = roleRepository.findByName("STAFF")
                    .orElseThrow(() -> new RuntimeException("STAFF role not found"));
            User staff = new User("Staff Member", "staff@vishwakarma.com", "8192456365",
                    passwordEncoder.encode("staff123"));
            staff.setRole(staffRole);
            userRepository.save(staff);
        }

        if (!userRepository.existsByEmail("customer@vishwakarma.com")) {
            User customer = new User("Customer", "customer@vishwakarma.com", "8192456366",
                    passwordEncoder.encode("customer123"));
            customer.setRole(memberRole);
            userRepository.save(customer);
        }
    }
}
