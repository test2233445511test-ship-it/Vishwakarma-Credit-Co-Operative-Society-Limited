import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { usePermissions } from '../hooks/usePermissions'
import {
  LayoutDashboard, Users, CreditCard, Landmark, PiggyBank,
  FileText, Settings, Shield, LogOut, ChevronLeft, ChevronRight,
  Menu, X, UserPlus, BarChart3
} from 'lucide-react'

export default function Sidebar() {
  const { hasRole } = usePermissions()
  const { signOut } = useClerk()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuGroups = [
    {
      label: 'Main',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
      ],
    },
    {
      label: 'Management',
      items: [
        { to: '/dashboard/manager', label: 'Approvals', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
        { to: '/dashboard/manager', label: 'Customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
        { to: '/data-entry', label: 'New Application', icon: UserPlus, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
      ],
    },
    {
      label: 'Accounts',
      items: [
        { to: '/dashboard', label: 'My Accounts', icon: Landmark, roles: ['MEMBER'] },
        { to: '/fd-calculator', label: 'FD Calculator', icon: PiggyBank, roles: null },
        { to: '/loan-calculator', label: 'Loan Calculator', icon: CreditCard, roles: null },
      ],
    },
    {
      label: 'Reports',
      items: [
        { to: '/dashboard/manager', label: 'Analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN'] },
      ],
    },
    {
      label: 'Admin',
      items: [
        { to: '/dashboard/super-admin', label: 'Audit Logs', icon: Shield, roles: ['SUPER_ADMIN'] },
        { to: '/dashboard/super-admin', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
      ],
    },
  ]

  const filteredGroups = menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        !item.roles || hasRole(item.roles[0])
      ),
    }))
    .filter(group => group.items.length > 0)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const sidebarContent = (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-title">VCCS Bank</span>}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredGroups.map((group) => (
          <div key={group.label} className="sidebar-group">
            {!collapsed && <span className="sidebar-group-label">{group.label}</span>}
            {group.items.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={`sidebar-link ${isActive(item.to) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-btn" onClick={() => signOut()}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar-desktop ${collapsed ? 'collapsed' : ''}`}>
        {sidebarContent}
      </div>

      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="sidebar-mobile" onClick={e => e.stopPropagation()}>
            <div className="sidebar-mobile-header">
              <span>VCCS Bank</span>
              <button onClick={() => setMobileOpen(false)}><X size={24} /></button>
            </div>
            <nav className="sidebar-nav">
              {filteredGroups.map((group) => (
                <div key={group.label} className="sidebar-group">
                  <span className="sidebar-group-label">{group.label}</span>
                  {group.items.map((item) => (
                    <Link
                      key={item.to + item.label}
                      to={item.to}
                      className={`sidebar-link ${isActive(item.to) ? 'active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
              <button className="sidebar-link logout-btn" onClick={() => signOut()}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
