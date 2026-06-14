import { useState } from 'react'
import { LayoutDashboard, Users, FileText, Activity, BarChart3 } from 'lucide-react'
import AdminRequestManagement from '../components/AdminRequestManagement'
import AdminUserManagement from '../components/AdminUserManagement'
import AdminAnalytics from '../components/AdminAnalytics'
import AdminActivityLog from '../components/AdminActivityLog'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'requests', label: 'Requests', icon: FileText },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'activity', label: 'Activity Log', icon: Activity },
]

export default function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && <AdminAnalytics />}
        {activeTab === 'requests' && <AdminRequestManagement />}
        {activeTab === 'users' && <AdminUserManagement />}
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'activity' && <AdminActivityLog />}
      </div>
    </div>
  )
}
