import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function RequestList({ onSelect, refreshTrigger }) {
  const { getToken } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = await getToken()
        const res = await fetch(apiUrl('/requests'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setRequests(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [getToken, refreshTrigger])

  const statusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} color="#f59e0b" />
      case 'IN_PROGRESS': return <AlertTriangle size={16} color="#3b82f6" />
      case 'RESOLVED': return <CheckCircle size={16} color="#10b981" />
      case 'CLOSED': return <XCircle size={16} color="#6b7280" />
      default: return <FileText size={16} />
    }
  }

  const typeLabel = (type) => {
    const labels = {
      LOAN: 'Loan Request',
      ACCOUNT_OPEN: 'Account Opening',
      DOCUMENT_UPDATE: 'Document Update',
      GENERAL: 'General Inquiry',
    }
    return labels[type] || type
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} color="var(--text-light)" />
        <h3>No Requests Yet</h3>
        <p>Submit your first service request to get started.</p>
      </div>
    )
  }

  return (
    <div className="request-list">
      {requests.map(req => (
        <div key={req.id} className="request-card" onClick={() => onSelect?.(req)}>
          <div className="request-header">
            <span className="request-type">{typeLabel(req.type)}</span>
            <span className={`request-status status-${req.status?.toLowerCase()}`}>
              {statusIcon(req.status)}
              <span>{req.status}</span>
            </span>
          </div>
          <p className="request-desc">{req.description}</p>
          <div className="request-meta">
            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
            {req.updatedAt && <span>Updated: {new Date(req.updatedAt).toLocaleDateString()}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
