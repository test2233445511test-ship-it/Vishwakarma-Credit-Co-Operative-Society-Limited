import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="forbidden-page">
      <div className="forbidden-card">
        <ShieldAlert size={80} strokeWidth={1.5} color="var(--secondary)" />
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You do not have the required permissions to access this page.</p>
        <div className="forbidden-actions">
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/dashboard" className="btn btn-outline">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
