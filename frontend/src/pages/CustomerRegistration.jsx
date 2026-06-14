import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { FileText, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'

export default function CustomerRegistration() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '', dateOfBirth: '', gender: 'Male', phone: '', email: '',
    aadhaarNumber: '', panNumber: '', address: '', city: '', state: '',
    pinCode: '', occupation: '', nomineeName: '', nomineeRelationship: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login')
    }
  }, [isLoaded, isSignedIn, navigate])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:8080/api/data-entry/customer-application', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setSuccess('Application submitted successfully! It is now pending Manager approval.')
        setFormData({
          name: '', dateOfBirth: '', gender: 'Male', phone: '', email: '',
          aadhaarNumber: '', panNumber: '', address: '', city: '', state: '',
          pinCode: '', occupation: '', nomineeName: '', nomineeRelationship: ''
        })
      } else {
        const err = await res.text()
        setError(err)
      }
    } catch {
      setError('Failed to submit application. Ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || !isSignedIn) return null

  const userRole = user?.publicMetadata?.role || "Data Entry Operator"

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#1e293b', color: '#fff', padding: '20px 0' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#38bdf8' }}>Data Entry</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>{user.fullName}</p>
          <span style={{ display: 'inline-block', marginTop: '10px', background: '#0ea5e9', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>{userRole}</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: '#334155', color: '#38bdf8', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontWeight: '600' }}
          >
            <UserPlus size={18} /> New Application
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'transparent', color: '#cbd5e1', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <FileText size={18} /> Back to Dashboard
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', border: '1px solid #eee', width: '100%', maxWidth: '800px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '30px', borderBottom: '2px solid #f8f9fa', paddingBottom: '15px' }}>
            <h2 style={{ color: '#1e293b' }}>Customer Registration Form</h2>
            <p style={{ color: '#64748b' }}>Enter applicant details to generate a new account request.</p>
          </div>

          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18}/> {error}</div>}
          {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18}/> {success}</div>}

          <form onSubmit={handleSubmit}>
            <h4 style={{ color: '#0ea5e9', marginBottom: '15px' }}>1. Personal Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Mobile Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required />
              </div>
            </div>

            <h4 style={{ color: '#0ea5e9', marginBottom: '15px' }}>2. KYC Documents</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="input-group">
                <label>Aadhaar Number</label>
                <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required maxLength={12} />
              </div>
              <div className="input-group">
                <label>PAN Number</label>
                <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} required maxLength={10} style={{ textTransform: 'uppercase' }} />
              </div>
            </div>

            <h4 style={{ color: '#0ea5e9', marginBottom: '15px' }}>3. Address Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Full Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', resize: 'vertical' }} />
              </div>
              <div className="input-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>PIN Code</label>
                <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} required maxLength={6} />
              </div>
            </div>

            <h4 style={{ color: '#0ea5e9', marginBottom: '15px' }}>4. Nominee Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="input-group">
                <label>Nominee Name</label>
                <input type="text" name="nomineeName" value={formData.nomineeName} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Relationship</label>
                <input type="text" name="nomineeRelationship" value={formData.nomineeRelationship} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ borderTop: '2px solid #f8f9fa', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
