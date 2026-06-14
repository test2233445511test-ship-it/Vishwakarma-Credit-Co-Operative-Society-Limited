# Enterprise Security & RBAC Upgrade — Implementation Plan

## Overview
Transform the current single-role banking app into a multi-role, enterprise-grade platform with Clerk authentication, strict RBAC, audit logging, and comprehensive security controls.

---

## Phase 1 — Foundation: Clerk Auth & Environment Setup
**Effort: 2-3 days**

### 1.1 Clerk Integration
- [x] Set up Clerk project (dashboard.clerk.com)
- [x] Add `@clerk/clerk-react` to frontend
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Enable MFA/2FA
- [ ] Add password reset flow
- [ ] Configure session management (token refresh, expiry)

### 1.2 Environment Variables
- [x] Create `.env` files (dev/staging/production):
  ```
  VITE_CLERK_PUBLISHABLE_KEY=placeholder
  ```
- [ ] Add `.env.example` with documented placeholders

### 1.3 Replace Current Auth
- [ ] Remove `AuthContext.jsx`, `useAuth.jsx` (dead code, still present)
- [x] Remove backend `AuthController`, `JwtUtil`, `JwtAuthFilter`, `CustomUserDetailsService`
- [x] Remove old DTOs: `AuthRequest`, `RegisterRequest`, `AuthResponse`, `OtpRequest`, `OtpVerifyRequest`
- [x] Wrap app with `<ClerkProvider>`
- [x] Replace login/register pages with Clerk `<SignIn>` / `<SignUp>` components
- [x] Replace Navbar to use Clerk `useUser` and `useClerk` hooks
- [x] Update Dashboard, CustomerDashboard, ManagerDashboard to use Clerk `useUser`

### 1.4 Backend JWT Validation
- [x] Add Clerk JWT verification filter (validates Clerk-signed tokens)
- [x] Extract user ID and role from JWT claims
- [x] Remove old password-based auth (jjwt removed, SecurityConfig updated)

### Deliverables
- Fully functional Clerk auth with Google OAuth + email/password
- MFA/2FA enabled
- Login/register pages replaced
- Backend validates Clerk JWTs

---

## Phase 2 — RBAC Data Model & Database
**Effort: 1-2 days**

### 2.1 Database Schema Changes
- [x] Create `roles` table (Role entity)
- [x] Create `permissions` table (Permission entity)
- [x] Create `role_permissions` join table (@ManyToMany in Role)
- [x] Add `role_id` FK to `users` table
- [x] Create `audit_logs` table (AuditLog entity)
- [x] Create `login_attempts` table (LoginAttempt entity)
- [x] Create `user_sessions` table for active session tracking (UserSession entity)

### 2.2 Row-Level Security
- [x] Existing entities (FixedDeposit, LoanAccount, etc.) already have `@ManyToOne User user` (customer_id equivalent)
- [ ] Add `assigned_to` FK to staff assignments (deferred until request entities are created)
- [ ] Implement Spring `@EntityFilter` or `@PostFilter` for data isolation (Phase 3)

### 2.3 Seeder Data
- [x] Seed default roles and permissions (4 roles, 21 permissions)
- [x] Create a super admin bootstrap user (superadmin@vishwakarma.com / admin123)
- [x] Create demo users for each role (STAFF, MEMBER, plus existing SUPER_ADMIN)

### Deliverables
- Database schema with roles, permissions, audit logs
- Row-level ownership on all data tables
- Seed data for testing

---

## Phase 3 — Backend RBAC Security Layer
**Effort: 3-4 days**

### 3.1 Permission-Based Authorization
- [x] Create `@RequirePermission("permission.key")` annotation
- [x] Create `PermissionEvaluator` (checks user role + permissions)
- [x] Create `PermissionAspect` (AOP interceptor for @RequirePermission)
- [x] Build permission check utility service (PermissionEvaluator with hasPermission/hasAllPermissions/hasAnyPermission)

### 3.2 Security Filters & Middleware
- [x] Rate limiting filter per IP and per endpoint (Token Bucket / Sliding Window) — RateLimitingFilter
- [x] CSP header filter (Content-Security-Policy, X-Frame-Options, HSTS, etc.) — SecurityHeadersFilter
- [x] Input sanitization filter (strip XSS, SQL injection patterns) — InputSanitizationFilter
- [ ] CSRF protection filter (deferred — Clerk handles CSRF via session)
- [ ] Request validation filter (type checking, length limits — deferred, covered by @Valid)

### 3.3 Audit Logging
- [x] Create `@AuditLog("action", "resource")` annotation
- [x] Aspect that logs every annotated method call (AuditAspect)
- [x] Log: user, action, resource, details, IP, timestamp
- [x] Create audit log viewer API (AuditLogController — `/api/admin/audit`)

### 3.4 Account Security
- [x] Login attempt tracking (recordFailedAttempt / recordSuccessfulAttempt)
- [x] Auto lockout after N failed attempts (configurable via application.properties)
- [ ] Suspicious IP detection (different geographies in short time — deferred)
- [ ] Session invalidation on role change (Clerk handles sessions)

### 3.5 API Protection
- [x] All endpoints: verify auth (Clerk JWT — ClerkJwtAuthFilter)
- [x] Sensitive endpoints: verify specific permission (@RequirePermission on CustomerController, ManagerController)
- [x] Data endpoints: verify ownership (`WHERE user_id = :currentUserId` — CustomerController already scoped)
- [x] Admin endpoints: verify `request.approve` or `user.view` permission (ManagerController)

### Deliverables
- Full backend authorization layer
- Rate limiting, CSP, CSRF protection
- Complete audit logging
- Account lockout mechanism
- All APIs secured by role + permission

---

## Phase 4 — Frontend Architecture & RBAC UI
**Effort: 3-4 days**

### 4.1 Route Structure
```
/login
/signup  (Clerk handles internally)
/dashboard
/dashboard/customer  (ProtectedRoute, requiredRole="MEMBER")
/dashboard/manager   (ProtectedRoute, requiredRole="STAFF")
/dashboard/admin     (ProtectedRoute, requiredRole="ADMIN")
/dashboard/super-admin (ProtectedRoute, requiredRole="SUPER_ADMIN")
/data-entry          (ProtectedRoute, requiredRole="STAFF")
/403
```

### 4.2 Role-Based Router
- [x] Create `ProtectedRoute` component (checks role, redirects to `/403` if unauthorized)
- [x] Role-specific routes in App.jsx with `ProtectedRoute requiredRole`
- [x] Create `usePermissions` hook (role + permissions + hasRole/hasPermission from Clerk metadata)
- [x] Dynamic route registration based on role (role-specific dashboards in App.jsx)

### 4.3 Navigation System
- [x] Create `Sidebar` component (role-aware menu items, collapsible, mobile drawer)
- [x] Create `TopNav` component (breadcrumbs, user menu, notification bell)
- [x] Create breadcrumb config utility (`breadcrumbConfig.js`)
- [x] Menu items config per role (sidebar filters items by `hasRole()`)

### 4.4 Permission-Based Rendering
- [x] Create `<Can permission="key" role="..." fallback={null}>` component
- [x] Sidebar/TopNav hide unauthorized links via usePermissions hook
- [x] ProtectedRoute blocks entire routes at router level

### 4.5 Dashboard Shells
- [x] Create reusable `DashboardLayout` (sidebar + topnav + content area)
- [x] Create per-role wrapper pages (`pages/dashboards/DashboardCustomer.jsx`)
- [ ] Migrate full dashboard pages to use DashboardLayout (deferred to Phase 5-6)

### Deliverables
- Route protection at frontend level
- Role-aware navigation (sidebar + topbar)
- Permission-based component rendering
- Breadcrumb navigation
- Responsive mobile sidebar

---

## Phase 5 — Customer Dashboard
**Effort: 2-3 days**

### 5.1 Request Management
- [x] "Create New Request" form (type, description) — RequestForm component
- [x] Request list (own requests only, with status badges) — RequestList + RequestDetail components
- [x] Request detail view (status, description, timestamps, assignedTo)
- [x] Backend CRUD: ServiceRequest entity + CustomerRequestController (/api/requests)
- [ ] Real-time status tracking (polling — deferred, WebSocket in Phase 10)

### 5.2 Profile & Settings
- [x] Profile view/edit — ProfileSettings page (phone, address, city, state, pinCode, occupation)
- [x] Password change link (via Clerk)
- [x] 2FA status badge ("Coming Soon")
- [ ] Notification preferences (deferred)

### 5.3 Notifications
- [x] Notification panel with unread count — NotificationPanel component
- [x] Notification list (title, message, type, timestamp)
- [x] Mark as read / mark all read
- [x] Backend: Notification entity + NotificationController (/api/notifications)

### 5.4 Document Management
- [x] Upload documents (file type + size validation) — DocumentUpload component
- [x] Download submitted documents — DocumentList + download endpoint
- [x] Document history — Document entity + DocumentController (/api/documents)
- [x] File type whitelist (PDF, JPEG, PNG, DOC, DOCX), 10MB limit
- [x] FileStorageService with UUID naming, type validation

### Deliverables
- Fully functional customer portal
- Request CRUD with file uploads
- Real-time status updates
- Notification system

---

## Phase 6 — Admin Dashboard
**Effort: 2-3 days**

### 6.1 Request Management
- [ ] All requests list (with filters: status, type, date range)
- [ ] Request detail with full timeline
- [ ] Approve / Reject action buttons
- [ ] Assign to staff member

### 6.2 User Management
- [ ] User list (search, filter by role/status)
- [ ] User detail view (profile, activity, requests)
- [ ] Create / Edit / Deactivate users
- [ ] Role assignment

### 6.3 Reports & Analytics
- [ ] Request volume chart (daily/weekly/monthly)
- [ ] Approval rates and averages
- [ ] User growth statistics
- [ ] Export to CSV/PDF

### 6.4 Activity Logs
- [ ] Recent actions feed
- [ ] Filterable activity log

### Deliverables
- Admin request management with approvals
- User CRUD
- Basic analytics dashboard
- Activity feed

---

## Phase 7 — Staff/Agent Dashboard
**Effort: 1 day**

### 7.1 Assigned Requests
- [ ] View only assigned requests
- [ ] Update request status (in-progress, resolved, etc.)
- [ ] Add internal notes / comments
- [ ] Communicate with customer (internal messaging)

### Deliverables
- Staff can see and update their assigned requests only
- Communication thread with customers

---

## Phase 8 — Super Admin Dashboard
**Effort: 1-2 days**

### 8.1 System Management
- [ ] Role & permission management UI
- [ ] Audit log viewer (searchable, filterable)
- [ ] Security reports (failed logins, suspicious IPs)
- [ ] System configuration/settings
- [ ] API key management

### 8.2 Monitoring
- [ ] Active sessions viewer
- [ ] Rate limit breach reports
- [ ] Malware scan reports (file uploads)

### Deliverables
- Full system control panel
- Audit log explorer
- Security monitoring dashboard

---

## Phase 9 — Security Hardening & File Security
**Effort: 2-3 days**

### 9.1 File Upload Security
- [ ] File type whitelist (PDF, JPG, PNG, DOC — no executables)
- [ ] File size limits (configurable per role)
- [ ] Malware scanning (ClamAV integration or external API)
- [ ] Store files outside webroot with UUID names
- [ ] Serve files through authenticated download endpoint

### 9.2 Data Encryption
- [ ] Encrypt PII fields (phone, address) at DB level (AES-256)
- [ ] TLS enforcement (HTTPS redirect)
- [ ] Encrypted backups

### 9.3 Additional Protections
- [ ] SQL Injection: parameterized queries already (JPA), add query-level validation
- [ ] XSS: output encoding, CSP headers
- [ ] CSRF: double-submit cookie + SameSite=Strict
- [ ] Clickjacking: X-Frame-Options: DENY
- [ ] SSRF: URL allowlist for external fetches
- [ ] Brute force: rate limiting + account lockout

### 9.4 Security Headers
```nginx
Content-Security-Policy: default-src 'self'; script-src 'self' https://clerk.accounts.dev; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Deliverables
- Secure file upload pipeline
- Encrypted sensitive data at rest
- All security headers configured
- Comprehensive attack vector protection

---

## Phase 10 — Testing, Deployment & Documentation
**Effort: 2-3 days**

### 10.1 Testing
- [ ] Unit tests for permission evaluator
- [ ] Integration tests for each role's API access
- [ ] Penetration testing (OWASP Top 10)
- [ ] Rate limit testing
- [ ] File upload security testing
- [ ] Session/access control boundary testing

### 10.2 Deployment Configuration
- [ ] Docker compose with all services
- [ ] Nginx reverse proxy config with security headers
- [ ] HTTPS certificate (Let's Encrypt)
- [ ] Environment-specific configs
- [ ] CI/CD pipeline (GitHub Actions)

### 10.3 Documentation
- [ ] API documentation (role-protected endpoints)
- [ ] Deployment runbook
- [ ] Security incident response procedure
- [ ] User role matrix

### Deliverables
- Tested, production-ready deployment
- Docker + Nginx config
- Full documentation

---

## Summary Timeline

| Phase | Description | Days |
|-------|-------------|------|
| 1 | Clerk Auth & Environment | 2-3 |
| 2 | RBAC Data Model & DB | 1-2 |
| 3 | Backend RBAC Security | 3-4 |
| 4 | Frontend RBAC & UI | 3-4 |
| 5 | Customer Dashboard | 2-3 |
| 6 | Admin Dashboard | 2-3 |
| 7 | Staff Dashboard | 1 |
| 8 | Super Admin Dashboard | 1-2 |
| 9 | Security Hardening | 2-3 |
| 10 | Testing & Deploy | 2-3 |

**Total: ~20-28 days**

## Key Integration Points
- Clerk user ID maps to database `users.id` via webhook
- Role stored in Clerk metadata + local `users.role_id`
- Permissions evaluated server-side only (frontend is cosmetic)
- All data queries include `WHERE user_id = :currentUserId` (row-level security)
