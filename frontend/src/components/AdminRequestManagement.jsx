import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Check, X, UserCheck, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function AdminRequestManagement() {
  const { getToken } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken()
        const url = filter === 'pending'
          ? apiUrl('/admin/requests/pending')
          : apiUrl('/admin/requests')
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        if (res.ok) setRequests(await res.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [getToken, filter])

  const updateStatus = async (id, status, assignedTo) => {
    try {
      const token = await getToken()
      const body = { status }
      if (assignedTo) body.assignedTo = assignedTo
      const res = await fetch(apiUrl(`/admin/requests/${id}/status`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) setRequests(prev => prev.map(r => r.id === id ? { ...r, status, assignedTo } : r))
    } catch (err) { console.error(err) }
  }

  const statusIcon = (s) => {
    switch (s) {
      case 'PENDING': return <Clock size={16} color="#f59e0b" />
      case 'IN_PROGRESS': return <AlertTriangle size={16} color="#3b82f6" />
      case 'RESOLVED': return <CheckCircle size={16} color="#10b981" />
      case 'CLOSED': return <XCircle size={16} color="#6b7280" />
      default: return null
    }
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div>
      <div className="section-header">
        <h3>Service Requests</h3>
        <div className="filter-group">
          <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('pending')}>Pending</button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state"><p>No requests found.</p></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td><span className="badge badge-type">{r.type}</span></td>
                  <td className="desc-cell">{r.description}</td>
                  <td>
                    <span className={`status-badge-sm ${r.status?.toLowerCase()}`}>
                      {statusIcon(r.status)} {r.status}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-group">
                      {r.status === 'PENDING' && (
                        <>
                          <button className="btn btn-sm btn-success" title="Mark In Progress" onClick={() => updateStatus(r.id, 'IN_PROGRESS', null)}>
                            <UserCheck size={14} />
                          </button>
                          <button className="btn btn-sm btn-success" title="Resolve" onClick={() => updateStatus(r.id, 'RESOLVED', null)}>
                            <Check size={14} />
                          </button>
                          <button className="btn btn-sm btn-danger" title="Close" onClick={() => updateStatus(r.id, 'CLOSED', null)}>
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {r.status === 'IN_PROGRESS' && (
                        <>
                          <button className="btn btn-sm btn-success" title="Resolve" onClick={() => updateStatus(r.id, 'RESOLVED', null)}>
                            <Check size={14} />
                          </button>
                          <button className="btn btn-sm btn-danger" title="Close" onClick={() => updateStatus(r.id, 'CLOSED', null)}>
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
