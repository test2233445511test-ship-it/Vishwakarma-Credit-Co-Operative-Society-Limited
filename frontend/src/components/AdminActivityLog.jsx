import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Clock, Search, Activity } from 'lucide-react'

export default function AdminActivityLog() {
  const { getToken } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:8080/api/admin/audit', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setLogs(await res.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [getToken])

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.resource?.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  )

  const actionColor = (action) => {
    if (action?.includes('CREATE') || action?.includes('APPROVE')) return '#10b981'
    if (action?.includes('REJECT') || action?.includes('DELETE')) return '#ef4444'
    if (action?.includes('UPDATE')) return '#3b82f6'
    return '#6b7280'
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div>
      <div className="section-header">
        <h3>Activity Log</h3>
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No activity logs found.</p></div>
      ) : (
        <div className="activity-log">
          {filtered.map(log => (
            <div key={log.id} className="activity-item">
              <div className="activity-icon" style={{ background: `${actionColor(log.action)}15`, color: actionColor(log.action) }}>
                <Activity size={18} />
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-action">{log.action}</span>
                  <span className="activity-resource">{log.resource}</span>
                  <span className="activity-time">
                    <Clock size={12} />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                {log.details && <p className="activity-details">{log.details}</p>}
                <div className="activity-meta">
                  {log.userId && <span className="activity-user">User: {log.userId}</span>}
                  {log.ip && <span className="activity-ip">IP: {log.ip}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
