import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { usePermissions } from '../hooks/usePermissions'

export default function ProtectedRoute({ children, requiredRole, requiredPermission }) {
  const { isLoaded, isSignedIn } = useUser()
  const { hasRole, hasPermission } = usePermissions()

  if (!isLoaded) {
    return <div className="page-loading"><div className="spinner" /></div>
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/403" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/403" replace />
  }

  return children
}
