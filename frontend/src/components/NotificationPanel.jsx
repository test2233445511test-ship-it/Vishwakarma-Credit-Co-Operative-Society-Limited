import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function NotificationPanel({ onClose }) {
  const { getToken } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken()
        const res = await fetch(apiUrl('/notifications'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setNotifications(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [getToken])

  const markRead = async (id) => {
    try {
      const token = await getToken()
      await fetch(apiUrl(`/notifications/${id}/read`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllRead = async () => {
    try {
      const token = await getToken()
      await fetch(apiUrl('/notifications/read-all'), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const typeIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={18} color="#10b981" />
      case 'WARNING': return <AlertTriangle size={18} color="#f59e0b" />
      case 'ERROR': return <AlertOctagon size={18} color="#ef4444" />
      default: return <Info size={18} color="#3b82f6" />
    }
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h3><Bell size={18} /> Notifications</h3>
          <div className="notification-actions">
            {unread > 0 && (
              <button className="btn btn-sm btn-outline" onClick={markAllRead}>Mark all read</button>
            )}
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} color="var(--text-light)" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`} onClick={() => !n.read && markRead(n.id)}>
                <div className="notif-icon">{typeIcon(n.type)}</div>
                <div className="notif-content">
                  <span className="notif-title">{n.title}</span>
                  <p className="notif-message">{n.message}</p>
                  <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.read && <div className="notif-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
