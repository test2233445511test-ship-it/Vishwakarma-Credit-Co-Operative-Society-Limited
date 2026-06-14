import { useUser } from '@clerk/clerk-react'

const ROLE_HIERARCHY = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  STAFF: 2,
  MEMBER: 1,
}

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'user.view', 'user.create', 'user.edit', 'user.delete', 'user.manage',
    'role.view', 'role.manage',
    'request.create', 'request.view', 'request.approve', 'request.assign', 'request.manage',
    'loan.create', 'loan.view', 'loan.approve', 'loan.manage',
    'account.view', 'account.manage',
    'report.view', 'report.export',
    'audit.view', 'settings.manage',
  ],
  ADMIN: [
    'user.view', 'user.create', 'user.edit',
    'request.view', 'request.approve', 'request.assign',
    'loan.view', 'loan.approve',
    'account.view', 'account.manage',
    'report.view', 'report.export',
  ],
  STAFF: [
    'request.view', 'request.approve',
    'loan.view',
    'account.view',
    'user.view',
  ],
  MEMBER: [
    'request.create', 'request.view',
    'loan.create', 'loan.view',
    'account.view',
  ],
}

export function usePermissions() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn || !user) {
    return { role: null, permissions: [], hasRole: () => false, hasPermission: () => false, can: () => false }
  }

  const role = user.publicMetadata?.role || 'MEMBER'
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.MEMBER
  const roleLevel = ROLE_HIERARCHY[role] || 0

  const hasRole = (requiredRole) => {
    const required = ROLE_HIERARCHY[requiredRole]
    return required !== undefined && roleLevel >= required
  }

  const hasPermission = (perm) => permissions.includes(perm)

  const can = (perm) => hasPermission(perm)

  return { role, permissions, hasRole, hasPermission, can }
}
