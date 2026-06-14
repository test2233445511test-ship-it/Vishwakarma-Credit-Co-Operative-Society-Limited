import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Inbox, UserCheck, Users, Search, Check, X, Clock, AlertTriangle, MessageSquare, Send, FileText } from 'lucide-react'

const tabs = [
  { id: 'requests', label: 'My Requests', icon: Inbox },
  { id: 'approvals', label: 'Approvals', icon: UserCheck },
  { id: 'customers', label: 'Customers', icon: Users },
]

export default function StaffDashboardContent() {
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('requests')

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
        {activeTab === 'requests' && <AssignedRequests getToken={getToken} />}
        {activeTab === 'approvals' && <PendingApprovals getToken={getToken} />}
        {activeTab === 'customers' && <CustomerLookup getToken={getToken} />}
      </div>
    </div>
  )
}

function AssignedRequests({ getToken }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [staffNotes, setStaffNotes] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:8080/api/staff/requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setRequests(await res.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [getToken])

  const updateStatus = async (id, status) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/staff/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRequests(prev => prev.map(r => r.id === id ? updated : r))
        if (selected?.id === id) setSelected(updated)
      }
    } catch (err) { console.error(err) }
  }

  const saveNotes = async (id) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/staff/requests/${id}/notes`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffNotes }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRequests(prev => prev.map(r => r.id === id ? updated : r))
        if (selected?.id === id) setSelected(updated)
      }
    } catch (err) { console.error(err) }
  }

  const statusActions = (req) => {
    if (req.status === 'PENDING') {
      return <button className="btn btn-sm btn-outline" style={{ color: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => updateStatus(req.id, 'IN_PROGRESS')}><Clock size={14} /> Start</button>
    }
    if (req.status === 'IN_PROGRESS') {
      return <>
        <button className="btn btn-sm btn-success" onClick={() => updateStatus(req.id, 'RESOLVED')}><Check size={14} /> Resolve</button>
      </>
    }
    if (req.status === 'RESOLVED') {
      return <button className="btn btn-sm btn-danger" onClick={() => updateStatus(req.id, 'CLOSED')}><X size={14} /> Close</button>
    }
    return null
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div>
      <h3>My Assigned Requests ({requests.length})</h3>

      {requests.length === 0 ? (
        <div className="empty-state"><p>No requests assigned to you.</p></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td><span className="badge-type">{req.type}</span></td>
                <td className="desc-cell">{req.description}</td>
                <td>
                  <span className={`status-badge-sm ${req.status?.toLowerCase()}`}>
                    {req.status === 'PENDING' && <Clock size={12} />}
                    {req.status === 'IN_PROGRESS' && <AlertTriangle size={12} />}
                    {req.status === 'RESOLVED' && <Check size={12} />}
                    {req.status === 'CLOSED' && <X size={12} />}
                    {req.status}
                  </span>
                </td>
                <td className="date-cell">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-group">
                    <button className="btn btn-sm btn-outline" onClick={() => { setSelected(req); setStaffNotes(req.staffNotes || '') }}><FileText size={14} /> Detail</button>
                    {statusActions(req)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content request-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
            <h3>Request Detail</h3>
            <div className="detail-grid">
              <div className="detail-field">
                <label>Type</label>
                <span className="badge-type">{selected.type}</span>
              </div>
              <div className="detail-field">
                <label>Status</label>
                <span className={`status-badge-sm ${selected.status?.toLowerCase()}`}>{selected.status}</span>
              </div>
              <div className="detail-field full-width">
                <label>Description</label>
                <p>{selected.description}</p>
              </div>
              <div className="detail-field">
                <label>Created</label>
                <span>{new Date(selected.createdAt).toLocaleString()}</span>
              </div>
              {selected.updatedAt && (
                <div className="detail-field">
                  <label>Updated</label>
                  <span>{new Date(selected.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="staff-notes-section">
              <h4><MessageSquare size={16} /> Staff Notes</h4>
              <textarea
                value={staffNotes}
                onChange={e => setStaffNotes(e.target.value)}
                placeholder="Add internal notes about this request..."
                rows={4}
              />
              <button className="btn btn-primary" onClick={() => saveNotes(selected.id)} disabled={staffNotes === (selected.staffNotes || '')}>
                <Send size={14} /> Save Notes
              </button>
            </div>

            {selected.status !== 'CLOSED' && (
              <div className="staff-actions">
                <h4>Update Status</h4>
                <div className="action-group">
                  {selected.status === 'PENDING' && (
                    <button className="btn btn-outline" style={{ color: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => { updateStatus(selected.id, 'IN_PROGRESS'); setSelected({...selected, status: 'IN_PROGRESS'}) }}>
                      <Clock size={14} /> Mark In Progress
                    </button>
                  )}
                  {selected.status === 'IN_PROGRESS' && (
                    <button className="btn btn-success" onClick={() => { updateStatus(selected.id, 'RESOLVED'); setSelected({...selected, status: 'RESOLVED'}) }}>
                      <Check size={14} /> Mark Resolved
                    </button>
                  )}
                  {(selected.status === 'IN_PROGRESS' || selected.status === 'RESOLVED') && (
                    <button className="btn btn-danger" onClick={() => { updateStatus(selected.id, 'CLOSED'); setSelected({...selected, status: 'CLOSED'}) }}>
                      <X size={14} /> Close
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PendingApprovals({ getToken }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:8080/api/admin/users/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setCustomers(await res.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [getToken])

  const approve = async (id) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/manager/approve-application/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) { console.error(err) }
  }

  const reject = async (id) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/manager/reject-application/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) { console.error(err) }
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '-'
  return (
    <div>
      <h3>Pending Account Applications ({customers.length})</h3>
      {customers.length === 0 ? (
        <div className="empty-state"><p>No pending applications.</p></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Aadhaar</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone}</td>
                <td>{c.aadhaarNumber || '-'}</td>
                <td className="date-cell">{fmtDate(c.createdAt)}</td>
                <td>
                  <div className="action-group">
                    <button className="btn btn-sm btn-success" onClick={() => approve(c.id)}><Check size={14} /> Approve</button>
                    <button className="btn btn-sm btn-danger" onClick={() => reject(c.id)}><X size={14} /> Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function CustomerLookup({ getToken }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:8080/api/manager/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setCustomers(await res.json())
        else setError('Failed to load customers')
      } catch (err) { console.error(err); setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [getToken])

  const filtered = search.trim() ? customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.accountNumber?.includes(search) ||
    c.phone?.includes(search) ||
    c.aadhaarNumber?.includes(search)
  ) : customers

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>
  if (error) return <div className="empty-state"><p>{error}</p></div>

  return (
    <div>
      <div className="section-header">
        <h3>Customer Database ({customers.length})</h3>
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search name, account, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>{search ? 'No matching customers found.' : 'No customers yet.'}</p></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>A/C No</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Aadhaar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td><strong style={{ color: 'var(--primary)' }}>{c.accountNumber || '-'}</strong></td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.aadhaarNumber || '-'}</td>
                <td>
                  <span className={`status-dot ${c.accountActive ? 'active' : 'inactive'}`} />
                  {c.accountActive ? 'Active' : 'Inactive'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
