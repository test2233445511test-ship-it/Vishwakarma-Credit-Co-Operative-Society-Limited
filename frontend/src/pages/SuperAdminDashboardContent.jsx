import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { LayoutDashboard, Shield, FileText, Activity, Users, Settings, Server, Key } from 'lucide-react'
import AdminActivityLog from '../components/AdminActivityLog'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'security', label: 'Security Reports', icon: Activity },
  { id: 'sessions', label: 'Active Sessions', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function SuperAdminDashboardContent() {
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
        {activeTab === 'overview' && <SystemOverview />}
        {activeTab === 'roles' && <RoleManager />}
        {activeTab === 'audit' && <AdminActivityLog />}
        {activeTab === 'security' && <SecurityReports />}
        {activeTab === 'sessions' && <ActiveSessions />}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
    </div>
  )
}

function SystemOverview() {
  const { getToken } = useAuth()
  const [health, setHealth] = useState(null)
  const [sessionStats, setSessionStats] = useState(null)
  const [loginStats, setLoginStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const headers = { 'Authorization': `Bearer ${token}` }
      const results = await Promise.allSettled([
        fetch('http://localhost:8080/api/super-admin/system/health', { headers }).then(r => r.json()),
        fetch('http://localhost:8080/api/super-admin/sessions/stats', { headers }).then(r => r.json()),
        fetch('http://localhost:8080/api/super-admin/login-attempts/stats', { headers }).then(r => r.json()),
      ])
      if (results[0].status === 'fulfilled') setHealth(results[0].value)
      if (results[1].status === 'fulfilled') setSessionStats(results[1].value)
      if (results[2].status === 'fulfilled') setLoginStats(results[2].value)
    }
    load()
  }, [getToken])

  const cards = [
    { label: 'System Status', value: health?.status || '...', icon: Server, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Total Users', value: health?.totalUsers ?? '...', icon: Users, color: '#1a73e8', bg: '#e8f0fe' },
    { label: 'Active Users', value: health?.activeUsers ?? '...', icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active Sessions', value: sessionStats?.activeNow ?? '...', icon: Activity, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Unique IPs', value: sessionStats?.uniqueIps ?? '...', icon: Shield, color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Today Logins', value: loginStats?.todaySuccess ?? '...', icon: Key, color: '#1a73e8', bg: '#e8f0fe' },
    { label: 'Today Failed', value: loginStats?.todayFailed ?? '...', icon: Activity, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Recent Attempts', value: loginStats?.recentAttempts ?? '...', icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
  ]

  return (
    <div>
      <h3>System Overview</h3>
      <div className="analytics-grid">
        {cards.map((c, i) => (
          <div key={i} className="analytics-card" style={{ background: c.bg }}>
            <div className="analytics-icon" style={{ color: c.color }}><c.icon size={28} /></div>
            <div className="analytics-value">{c.value}</div>
            <div className="analytics-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoleManager() {
  const { getToken } = useAuth()
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState(null)
  const [selectedPerms, setSelectedPerms] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const headers = { 'Authorization': `Bearer ${token}` }
      const [r, p] = await Promise.all([
        fetch('http://localhost:8080/api/super-admin/roles', { headers }).then(r => r.json()),
        fetch('http://localhost:8080/api/super-admin/permissions', { headers }).then(r => r.json()),
      ])
      setRoles(r)
      setPermissions(p)
      setLoading(false)
    }
    load()
  }, [getToken])

  const startEdit = (role) => {
    setEditingRole(role)
    setSelectedPerms(role.permissions?.map(p => p.id) || [])
  }

  const togglePerm = (permId) => {
    setSelectedPerms(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    )
  }

  const saveRole = async () => {
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/super-admin/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: selectedPerms }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r))
        setEditingRole(null)
      }
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div>
      <h3>Role & Permission Management</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
        <div>
          <h4>Roles</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map(role => (
              <div
                key={role.id}
                className={`activity-item ${editingRole?.id === role.id ? 'active' : ''}`}
                style={{ cursor: 'pointer', borderColor: editingRole?.id === role.id ? 'var(--primary)' : 'var(--border)' }}
                onClick={() => startEdit(role)}
              >
                <div className="activity-icon" style={{ background: '#e8f0fe', color: '#1a73e8' }}>
                  <Shield size={18} />
                </div>
                <div className="activity-content">
                  <strong>{role.name}</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '2px 0' }}>{role.description}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {role.permissions?.length || 0} permissions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {editingRole && (
          <div>
            <h4>Edit: {editingRole.name}</h4>
            <div className="perm-grid">
              {permissions.map(p => (
                <label key={p.id} className="perm-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPerms.includes(p.id)}
                    onChange={() => togglePerm(p.id)}
                  />
                  <div>
                    <strong>{p.name}</strong>
                    <span>{p.description}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="action-group" style={{ marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={saveRole} disabled={saving}>
                {saving ? 'Saving...' : 'Save Permissions'}
              </button>
              <button className="btn btn-outline" onClick={() => setEditingRole(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SecurityReports() {
  const { getToken } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const headers = { 'Authorization': `Bearer ${token}` }
      const [a, s] = await Promise.all([
        fetch('http://localhost:8080/api/super-admin/login-attempts', { headers }).then(r => r.json()),
        fetch('http://localhost:8080/api/super-admin/login-attempts/stats', { headers }).then(r => r.json()),
      ])
      setAttempts(a)
      setStats(s)
      setLoading(false)
    }
    load()
  }, [getToken])

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div>
      <h3>Security Reports</h3>
      {stats && (
        <div className="analytics-grid" style={{ marginBottom: '20px' }}>
          <div className="analytics-card" style={{ background: '#ecfdf5' }}>
            <div className="analytics-value" style={{ color: '#10b981' }}>{stats.todaySuccess}</div>
            <div className="analytics-label">Successful Today</div>
          </div>
          <div className="analytics-card" style={{ background: '#fef2f2' }}>
            <div className="analytics-value" style={{ color: '#ef4444' }}>{stats.todayFailed}</div>
            <div className="analytics-label">Failed Today</div>
          </div>
          <div className="analytics-card" style={{ background: '#fffbeb' }}>
            <div className="analytics-value" style={{ color: '#f59e0b' }}>{stats.recentFailed}</div>
            <div className="analytics-label">Failed (Last Hour)</div>
          </div>
          <div className="analytics-card" style={{ background: '#f5f3ff' }}>
            <div className="analytics-value" style={{ color: '#8b5cf6' }}>{stats.recentAttempts}</div>
            <div className="analytics-label">Total (Last Hour)</div>
          </div>
        </div>
      )}

      <h4>Recent Login Attempts</h4>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>IP</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {attempts.slice(0, 50).map(a => (
            <tr key={a.id}>
              <td>{a.email}</td>
              <td>{a.ip || '-'}</td>
              <td>
                <span className={`status-badge-sm ${a.success ? 'resolved' : 'pending'}`}>
                  {a.success ? 'Success' : 'Failed'}
                </span>
              </td>
              <td className="date-cell">{new Date(a.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {attempts.length > 50 && <p style={{ marginTop: '8px', color: 'var(--text-light)', fontSize: '0.85rem' }}>Showing last 50 of {attempts.length} attempts.</p>}
    </div>
  )
}

function ActiveSessions() {
  const { getToken } = useAuth()
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const headers = { 'Authorization': `Bearer ${token}` }
      const [s, st] = await Promise.all([
        fetch('http://localhost:8080/api/super-admin/sessions', { headers }).then(r => r.json()),
        fetch('http://localhost:8080/api/super-admin/sessions/stats', { headers }).then(r => r.json()),
      ])
      setSessions(s)
      setStats(st)
      setLoading(false)
    }
    load()
  }, [getToken])

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div>
      <h3>Active Sessions</h3>
      {stats && (
        <div className="analytics-grid" style={{ marginBottom: '20px' }}>
          <div className="analytics-card" style={{ background: '#f5f3ff' }}>
            <div className="analytics-value" style={{ color: '#8b5cf6' }}>{stats.activeNow}</div>
            <div className="analytics-label">Active Now</div>
          </div>
          <div className="analytics-card" style={{ background: '#e8f0fe' }}>
            <div className="analytics-value" style={{ color: '#1a73e8' }}>{stats.uniqueUsers}</div>
            <div className="analytics-label">Unique Users</div>
          </div>
          <div className="analytics-card" style={{ background: '#ecfdf5' }}>
            <div className="analytics-value" style={{ color: '#10b981' }}>{stats.uniqueIps}</div>
            <div className="analytics-label">Unique IPs</div>
          </div>
          <div className="analytics-card" style={{ background: '#eff6ff' }}>
            <div className="analytics-value" style={{ color: '#3b82f6' }}>{stats.totalSessions}</div>
            <div className="analytics-label">Total Sessions</div>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Session</th>
            <th>IP</th>
            <th>User Agent</th>
            <th>Created</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td style={{ fontSize: '0.8rem' }}>{s.clerkUserId?.substring(0, 12)}...</td>
              <td style={{ fontSize: '0.8rem' }}>{s.sessionId?.substring(0, 12)}...</td>
              <td>{s.ip || '-'}</td>
              <td className="desc-cell" style={{ maxWidth: '150px' }}>{s.userAgent}</td>
              <td className="date-cell">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="date-cell">{new Date(s.expiresAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SystemSettings() {
  return (
    <div>
      <h3>System Settings</h3>
      <div className="empty-state" style={{ marginTop: '20px' }}>
        <Server size={48} color="#ddd" />
        <p>System configuration will be available in a future update.</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Planned features:</p>
        <ul style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '2' }}>
          <li>API key management</li>
          <li>Rate limit configuration</li>
          <li>File upload size limits</li>
          <li>Maintenance mode toggle</li>
        </ul>
      </div>
    </div>
  )
}
