import { useUser } from '@clerk/clerk-react'
import CustomerDashboard from './CustomerDashboard'
import StaffDashboardContent from './StaffDashboardContent'
import AdminDashboardContent from './AdminDashboardContent'
import SuperAdminDashboardContent from './SuperAdminDashboardContent'

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) return <div className="page-loading"><div className="spinner" /></div>
  if (!isSignedIn || !user) return null

  const role = user.publicMetadata?.role || 'MEMBER'

  if (role === 'SUPER_ADMIN') {
    return <SuperAdminDashboardContent />
  }

  if (role === 'ADMIN') {
    return <AdminDashboardContent />
  }

  if (role === 'STAFF') {
    return <StaffDashboardContent />
  }

  return <CustomerDashboard />
}
