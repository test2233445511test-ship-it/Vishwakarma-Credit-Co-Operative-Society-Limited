import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import {
  Users, FileText, CheckCircle, Clock, UserPlus, Activity,
  TrendingUp, BarChart3
} from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function AdminAnalytics() {
  const { getToken } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken()
        const res = await fetch(apiUrl('/admin/analytics/summary'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setSummary(await res.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [getToken])

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>
  if (!summary) return <div className="empty-state"><p>Failed to load analytics.</p></div>

  const cards = [
    { label: 'Total Users', value: summary.totalUsers, icon: Users, color: '#1a73e8', bg: '#e8f0fe' },
    { label: 'Active Users', value: summary.activeUsers, icon: UserPlus, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Pending Applications', value: summary.pendingApplications, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Requests', value: summary.totalRequests, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending Requests', value: summary.pendingRequests, icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Resolved Requests', value: summary.resolvedRequests, icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
    { label: 'New Users (Month)', value: summary.usersThisMonth, icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Approval Rate', value: `${summary.approvalRate}%`, icon: BarChart3, color: '#0d9488', bg: '#f0fdfa' },
  ]

  return (
    <div>
      <h3>Analytics Dashboard</h3>
      <div className="analytics-grid">
        {cards.map((c, i) => (
          <div key={i} className="analytics-card" style={{ background: c.bg }}>
            <div className="analytics-icon" style={{ color: c.color }}>
              <c.icon size={28} />
            </div>
            <div className="analytics-value">{c.value}</div>
            <div className="analytics-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
