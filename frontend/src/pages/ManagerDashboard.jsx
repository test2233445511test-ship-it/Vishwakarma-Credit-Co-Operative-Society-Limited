import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Landmark, CreditCard, Shield, CheckCircle, Plus, Search, Check, X, Eye
} from 'lucide-react'

export default function ManagerDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('approvals')
  
  const [customers, setCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCustomers = async () => {
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:8080/api/manager/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login')
    }
  }, [isLoaded, isSignedIn, navigate])

  useEffect(() => {
    if (!isSignedIn) return
    const tokenPromise = getToken()
    tokenPromise.then(token => {
      fetch('http://localhost:8080/api/manager/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCustomers(data))
        .catch(console.error)
    })
  }, [isSignedIn, getToken])

  const approveApplication = async (userId) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/manager/approve-application/${userId}`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        alert("Application Approved!")
        fetchCustomers()
      } else {
        const err = await res.text()
        alert(err)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const rejectApplication = async (userId) => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/manager/reject-application/${userId}`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        alert("Application Rejected")
        fetchCustomers()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!isLoaded) return <div className="page-loading"><div className="spinner" /></div>
  if (!isSignedIn || !user) return null

  // Determine user role
  const userRole = user?.publicMetadata?.role || "Branch Manager"

  const pendingApplications = customers.filter(c => c.applicationStatus === 'PENDING')
  const approvedCustomers = customers.filter(c => c.applicationStatus === 'APPROVED' && (
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.accountNumber?.includes(searchQuery) ||
    c.phone?.includes(searchQuery) ||
    c.aadhaarNumber?.includes(searchQuery)
  ))

  const menuItems = [
    { id: 'approvals', label: 'Pending Approvals', icon: CheckCircle },
    { id: 'customers', label: 'All Customers', icon: Users },
    { id: 'rd', label: 'Manage RDs', icon: Landmark },
    { id: 'fd', label: 'Manage FDs', icon: Landmark },
    { id: 'loan', label: 'Manage Loans', icon: CreditCard },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'approvals':
        return (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Pending Account Applications</h3>
              <button onClick={() => navigate('/data-entry')} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Plus size={16} /> New Application
              </button>
            </div>
            {pendingApplications.length === 0 ? <p>No pending applications.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px' }}>Applicant Name</th>
                    <th>Mobile</th>
                    <th>Aadhaar</th>
                    <th>Date Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApplications.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.aadhaarNumber || 'N/A'}</td>
                      <td>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => approveApplication(c.id)} className="btn btn-sm btn-outline" style={{ color: 'green', borderColor: 'green', marginRight: '8px' }}><Check size={14} /></button>
                        <button onClick={() => rejectApplication(c.id)} className="btn btn-sm btn-outline" style={{ color: 'red', borderColor: 'red' }}><X size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      case 'customers':
        return (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Customer Database</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px' }}>
                <Search size={16} color="#888" />
                <input 
                  type="text" 
                  placeholder="Search Name, A/C, Mobile..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '250px' }}
                />
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px' }}>A/C Number</th>
                  <th>Customer Name</th>
                  <th>Mobile</th>
                  <th>Aadhaar</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedCustomers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1a73e8' }}>{c.accountNumber}</td>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.aadhaarNumber}</td>
                    <td><span style={{ color: c.accountActive ? 'green' : 'red', background: c.accountActive ? '#e8f5e9' : '#ffebee', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{c.accountActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="btn btn-sm btn-outline"><Eye size={14} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
            <Shield size={48} color="#ddd" style={{ margin: '0 auto 20px' }} />
            <h3>Module Under Construction</h3>
            <p style={{ color: '#666', maxWidth: '400px', margin: '0 auto' }}>This financial management module ({activeTab}) is highly sensitive and requires strict Role-Based Access Control integration which is currently being finalized.</p>
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#1e293b', color: '#fff', padding: '20px 0' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#38bdf8' }}>CBS Portal</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>{user?.fullName}</p>
          <span style={{ display: 'inline-block', marginTop: '10px', background: '#0ea5e9', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>{userRole}</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px',
                background: activeTab === item.id ? '#334155' : 'transparent',
                color: activeTab === item.id ? '#38bdf8' : '#cbd5e1',
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                fontWeight: activeTab === item.id ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px' }}>
        {renderContent()}
      </div>
    </div>
  )
}
