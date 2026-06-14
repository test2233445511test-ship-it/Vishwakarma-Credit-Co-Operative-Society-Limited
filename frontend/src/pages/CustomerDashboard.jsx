import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, CreditCard, Landmark, PiggyBank, Receipt,
  FileText, Bell, HelpCircle, LogOut, Plus
} from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import RequestList from '../components/RequestList'
import RequestForm from '../components/RequestForm'
import RequestDetail from '../components/RequestDetail'
import DocumentUpload from '../components/DocumentUpload'
import DocumentList from '../components/DocumentList'
import NotificationPanel from '../components/NotificationPanel'
import ProfileSettings from './ProfileSettings'

export default function CustomerDashboard() {
  const { isLoaded, isSignedIn } = useUser()
  const { getToken, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:8080/api/customer/dashboard-data', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        console.error("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isLoaded, isSignedIn, navigate, getToken])

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const downloadStatement = () => {
    if (!data) return
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(26, 115, 232)
    doc.text("Vishwakarma Cooperative Society Bank", 14, 22)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Statement Generated: ${new Date().toLocaleString()}`, 14, 30)
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text("Customer Information", 14, 45)
    doc.autoTable({
      startY: 50,
      head: [['Field', 'Details']],
      body: [
        ['Customer Name', data.accountDetails.name],
        ['Account Number', data.accountDetails.accountNumber],
        ['Mobile Number', data.accountDetails.phone],
        ['Branch', 'Main Branch - Davangere']
      ],
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: 0 }
    })
    doc.setFontSize(14)
    doc.text("Transaction History", 14, doc.lastAutoTable.finalY + 15)
    const txBody = data.transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.transactionId,
      tx.description,
      tx.creditAmount > 0 ? `+ Rs ${tx.creditAmount}` : '-',
      tx.debitAmount > 0 ? `- Rs ${tx.debitAmount}` : '-',
      `Rs ${tx.balanceAfterTransaction}`
    ])
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Txn ID', 'Description', 'Credit', 'Debit', 'Balance']],
      body: txBody,
      theme: 'striped',
      headStyles: { fillColor: [26, 115, 232], textColor: 255 }
    })
    doc.save(`Bank_Statement_${data.accountDetails.accountNumber}.pdf`)
  }

  if (loading) return <div className="page-loading"><div className="spinner" /></div>
  if (!data) return <div className="page-loading"><p>Failed to load data. Please refresh.</p></div>

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'rd', label: 'RD Details', icon: PiggyBank },
    { id: 'fd', label: 'FD Details', icon: Landmark },
    { id: 'loan', label: 'Loan Details', icon: CreditCard },
    { id: 'transactions', label: 'Transaction History', icon: Receipt },
    { id: 'requests', label: 'Service Requests', icon: HelpCircle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="dash-summary-grid">
              <div className="summary-card">
                <span>Total Balance</span>
                <h2>₹ {data.transactions.length > 0 ? data.transactions[0].balanceAfterTransaction : 0}</h2>
              </div>
              <div className="summary-card">
                <span>Active FDs</span>
                <h2>{data.fixedDeposits.length}</h2>
              </div>
              <div className="summary-card">
                <span>Active Loans</span>
                <h2>{data.loans.length}</h2>
              </div>
              <div className="summary-card">
                <span>Active RDs</span>
                <h2>{data.recurringDeposits.length}</h2>
              </div>
            </div>
            <div className="dash-actions-row" style={{ marginTop: 24 }}>
              <button className="btn btn-outline" onClick={downloadStatement}>
                <FileText size={18} /> Download Statement
              </button>
            </div>
          </>
        )
      case 'account':
        return (
          <div className="details-card">
            <h3>Account Information</h3>
            <table className="info-table">
              <tbody>
                <tr><td>Name</td><td>{data.accountDetails.name}</td></tr>
                <tr><td>Account Number</td><td>{data.accountDetails.accountNumber}</td></tr>
                <tr><td>Mobile Number</td><td>{data.accountDetails.phone}</td></tr>
                <tr><td>Account Status</td><td><span className="status-active">Active</span></td></tr>
                <tr><td>Branch</td><td>Main Branch, Davangere</td></tr>
                <tr><td>Member Since</td><td>{new Date(data.accountDetails.createdAt).toLocaleDateString()}</td></tr>
              </tbody>
            </table>
          </div>
        )
      case 'rd':
        return (
          <div>
            <h3>Recurring Deposits</h3>
            {data.recurringDeposits.map(rd => (
              <div key={rd.id} className="detail-card-item">
                <h4>A/C: {rd.rdAccountNumber}</h4>
                <div className="detail-grid">
                  <div><strong>Monthly Deposit:</strong> ₹ {rd.monthlyDepositAmount}</div>
                  <div><strong>Total Deposited:</strong> ₹ {rd.totalDepositedAmount}</div>
                  <div><strong>Maturity Date:</strong> {rd.maturityDate}</div>
                  <div><strong>Maturity Amount:</strong> ₹ {rd.maturityAmount}</div>
                </div>
              </div>
            ))}
            {data.recurringDeposits.length === 0 && <p className="empty-text">No Active RDs.</p>}
          </div>
        )
      case 'fd':
        return (
          <div>
            <h3>Fixed Deposits</h3>
            {data.fixedDeposits.map(fd => (
              <div key={fd.id} className="detail-card-item">
                <h4>A/C: {fd.fdAccountNumber}</h4>
                <div className="detail-grid">
                  <div><strong>Deposit Amount:</strong> ₹ {fd.depositAmount}</div>
                  <div><strong>Interest Rate:</strong> {fd.interestRate}%</div>
                  <div><strong>Maturity Date:</strong> {fd.maturityDate}</div>
                  <div><strong>Maturity Amount:</strong> ₹ {fd.maturityAmount}</div>
                </div>
              </div>
            ))}
            {data.fixedDeposits.length === 0 && <p className="empty-text">No Active FDs.</p>}
          </div>
        )
      case 'loan':
        return (
          <div>
            <h3>Loan Accounts</h3>
            {data.loans.map(loan => (
              <div key={loan.id} className="detail-card-item">
                <h4>{loan.loanType} - {loan.loanAccountNumber}</h4>
                <div className="detail-grid">
                  <div><strong>Loan Amount:</strong> ₹ {loan.loanAmount}</div>
                  <div><strong>EMI:</strong> ₹ {loan.emiAmount}</div>
                  <div><strong>Remaining Balance:</strong> ₹ {loan.remainingBalance}</div>
                  <div><strong>Due Date:</strong> {loan.dueDate}</div>
                  <div><strong>Status:</strong> {loan.loanStatus}</div>
                </div>
              </div>
            ))}
            {data.loans.length === 0 && <p className="empty-text">No Active Loans.</p>}
          </div>
        )
      case 'transactions':
        return (
          <div className="details-card">
            <h3>Recent Transactions</h3>
            <table className="info-table">
              <thead>
                <tr><th>Date</th><th>Description</th><th>Credit</th><th>Debit</th><th>Balance</th></tr>
              </thead>
              <tbody>
                {data.transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.description}</td>
                    <td className="txn-credit">{tx.creditAmount > 0 ? `+ ₹${tx.creditAmount}` : '-'}</td>
                    <td className="txn-debit">{tx.debitAmount > 0 ? `- ₹${tx.debitAmount}` : '-'}</td>
                    <td className="txn-balance">₹{tx.balanceAfterTransaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'requests':
        return (
          <div>
            <div className="section-header">
              <h3>Service Requests</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowRequestForm(!showRequestForm)}>
                <Plus size={16} /> {showRequestForm ? 'Cancel' : 'New Request'}
              </button>
            </div>
            {showRequestForm && (
              <RequestForm onSuccess={() => { setRefreshTrigger(v => v + 1); setShowRequestForm(false) }} />
            )}
            <RequestList onSelect={setSelectedRequest} refreshTrigger={refreshTrigger} />
            <RequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />
          </div>
        )
      case 'documents':
        return (
          <div>
            <h3>My Documents</h3>
            <DocumentUpload onUpload={() => setRefreshTrigger(v => v + 1)} />
            <div style={{ marginTop: 24 }}>
              <DocumentList />
            </div>
          </div>
        )
      case 'profile':
        return <ProfileSettings />
      default:
        return null
    }
  }

  return (
    <div className="customer-dashboard">
      <div className="cd-sidebar">
        <div className="cd-sidebar-header">
          <h2>Customer Portal</h2>
          <p>Welcome, {data.accountDetails.name}</p>
        </div>
        <nav className="cd-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`cd-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          <div className="cd-nav-divider" />
          <button className="cd-nav-item" onClick={downloadStatement}>
            <FileText size={18} /> Download Statement
          </button>
          <button className="cd-nav-item" onClick={() => setShowNotifications(true)}>
            <Bell size={18} /> Notifications
          </button>
          <button className="cd-nav-item logout" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </div>

      <div className="cd-content">
        {renderContent()}
      </div>

      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
    </div>
  )
}
