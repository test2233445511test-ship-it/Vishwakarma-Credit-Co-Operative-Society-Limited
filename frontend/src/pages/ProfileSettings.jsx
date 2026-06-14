import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Save, Loader, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function ProfileSettings() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken()
        const res = await fetch(apiUrl('/customer/profile'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setForm({
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            pinCode: data.pinCode || '',
            occupation: data.occupation || '',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [getToken])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const token = await getToken()
      const res = await fetch(apiUrl('/customer/profile'), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSaved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div className="profile-settings">
      <div className="profile-header-card">
        <div className="profile-avatar">
          <User size={40} />
        </div>
        <div className="profile-info">
          <h2>{user?.fullName || profile?.name}</h2>
          <span><Mail size={14} /> {user?.emailAddresses?.[0]?.emailAddress || profile?.email}</span>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <h3>Contact Information</h3>

        <div className="form-row">
          <div className="input-group">
            <label><Phone size={14} /> Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label><MapPin size={14} /> Address</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>State</label>
            <input name="state" value={form.state} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>PIN Code</label>
            <input name="pinCode" value={form.pinCode} onChange={handleChange} />
          </div>
        </div>

        <div className="input-group">
          <label><Briefcase size={14} /> Occupation</label>
          <input name="occupation" value={form.occupation} onChange={handleChange} />
        </div>

        <div className="form-actions">
          {saved && <span className="success-msg">Profile updated successfully</span>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader size={18} className="spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="profile-section">
        <h3>Account Security</h3>
        <div className="security-card">
          <div className="security-row">
            <div>
              <span>Password</span>
              <p>Managed by Clerk. Click to change your password.</p>
            </div>
            <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              Change Password
            </a>
          </div>
          <div className="security-row">
            <div>
              <span>Two-Factor Authentication</span>
              <p>Add an extra layer of security to your account.</p>
            </div>
            <span className="badge badge-secondary">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
