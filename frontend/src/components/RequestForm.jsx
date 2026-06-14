import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Send, Loader } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function RequestForm({ onSuccess }) {
  const { getToken } = useAuth()
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!type || !description.trim()) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(apiUrl('/requests'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description })
      })
      if (res.ok) {
        setType('')
        setDescription('')
        onSuccess?.()
      } else {
        const msg = await res.text()
        setError(msg || 'Failed to submit request')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <h3>New Service Request</h3>

      {error && <div className="form-error">{error}</div>}

      <div className="input-group">
        <label>Request Type</label>
        <select value={type} onChange={e => setType(e.target.value)} required>
          <option value="">Select type...</option>
          <option value="LOAN">Loan Request</option>
          <option value="ACCOUNT_OPEN">Account Opening</option>
          <option value="DOCUMENT_UPDATE">Document Update</option>
          <option value="GENERAL">General Inquiry</option>
        </select>
      </div>

      <div className="input-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your request in detail..."
          rows={5}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
