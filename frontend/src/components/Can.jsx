import { usePermissions } from '../hooks/usePermissions'

export default function Can({ permission, role, children, fallback = null }) {
  const { hasPermission, hasRole } = usePermissions()

  if (permission && !hasPermission(permission)) return fallback
  if (role && !hasRole(role)) return fallback

  return children
}
