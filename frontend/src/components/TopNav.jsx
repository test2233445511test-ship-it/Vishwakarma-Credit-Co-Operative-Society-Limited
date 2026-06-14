import { useLocation, Link } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { usePermissions } from '../hooks/usePermissions'
import { getBreadcrumbs } from '../utils/breadcrumbConfig'
import { Bell, User, LogOut, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function TopNav() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { role } = usePermissions()
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(location.pathname)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="topnav">
      <div className="topnav-breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="breadcrumb-item">
            {i > 0 && <ChevronRight size={14} className="breadcrumb-sep" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="breadcrumb-link">{crumb.label}</Link>
            )}
          </span>
        ))}
      </div>

      <div className="topnav-actions">
        <button className="topnav-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="topnav-user">
          <button className="topnav-user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div className="topnav-avatar">
              <User size={18} />
            </div>
            <div className="topnav-user-info">
              <span className="topnav-user-name">{user?.fullName || user?.emailAddresses?.[0]?.emailAddress}</span>
              <span className="topnav-user-role">{role}</span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="topnav-dropdown">
              <div className="topnav-dropdown-header">
                <span className="topnav-dropdown-name">{user?.fullName}</span>
                <span className="topnav-dropdown-email">{user?.emailAddresses?.[0]?.emailAddress}</span>
              </div>
              <hr />
              <button className="topnav-dropdown-item" onClick={() => { signOut(); setUserMenuOpen(false) }}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
