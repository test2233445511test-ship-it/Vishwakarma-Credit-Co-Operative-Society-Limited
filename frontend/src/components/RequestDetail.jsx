import { X, Clock, CheckCircle, XCircle, AlertTriangle, User, Calendar } from 'lucide-react'

export default function RequestDetail({ request, onClose }) {
  if (!request) return null

  const statusInfo = {
    PENDING: { label: 'Pending', icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    IN_PROGRESS: { label: 'In Progress', icon: AlertTriangle, color: '#3b82f6', bg: '#eff6ff' },
    RESOLVED: { label: 'Resolved', icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
    CLOSED: { label: 'Closed', icon: XCircle, color: '#6b7280', bg: '#f3f4f6' },
  }

  const typeLabels = {
    LOAN: 'Loan Request',
    ACCOUNT_OPEN: 'Account Opening',
    DOCUMENT_UPDATE: 'Document Update',
    GENERAL: 'General Inquiry',
  }

  const Status = statusInfo[request.status] || statusInfo.PENDING

  return (
    <div className="request-detail-overlay" onClick={onClose}>
      <div className="request-detail" onClick={e => e.stopPropagation()}>
        <div className="request-detail-header">
          <h3>{typeLabels[request.type] || request.type}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="request-detail-body">
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="status-badge" style={{ background: Status.bg, color: Status.color }}>
              <Status.icon size={16} />
              {Status.label}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Description</span>
            <p className="detail-value">{request.description}</p>
          </div>

          <div className="detail-row">
            <Calendar size={16} />
            <span>Created: {new Date(request.createdAt).toLocaleString()}</span>
          </div>

          {request.updatedAt && (
            <div className="detail-row">
              <Calendar size={16} />
              <span>Updated: {new Date(request.updatedAt).toLocaleString()}</span>
            </div>
          )}

          {request.assignedTo && (
            <div className="detail-row">
              <User size={16} />
              <span>Assigned to: {request.assignedTo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
