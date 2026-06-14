import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Search, Check, X } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function AdminUserManagement() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState([])
  const [roles] = useState(['SUPER_ADMIN', 'ADMIN', 'STAFF', 'MEMBER'])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken()
        const res = await fetch(apiUrl('/admin/users'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setUsers(await res.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [getToken])

  const updateRole = async (userId, role) => {
    try {
      const token = await getToken()
      const res = await fetch(apiUrl(`/admin/users/${userId}/role`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUsers(prev => prev.map(u => u.id === userId ? updated : u))
      }
    } catch (err) { console.error(err) }
  }

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const token = await getToken()
      const res = await fetch(apiUrl(`/admin/users/${userId}/status`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUsers(prev => prev.map(u => u.id === userId ? updated : u))
      }
    } catch (err) { console.error(err) }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  return (
    <div>
      <div className="section-header">
        <h3>User Management</h3>
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Account</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.accountNumber || '-'}</td>
                <td>
                  <select
                    value={u.role?.name || 'MEMBER'}
                    onChange={e => updateRole(u.id, e.target.value)}
                    className="role-select"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  <span className={`status-dot ${u.accountActive ? 'active' : 'inactive'}`} />
                  {u.accountActive ? 'Active' : 'Inactive'}
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${u.accountActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => toggleStatus(u.id, u.accountActive)}
                    title={u.accountActive ? 'Deactivate' : 'Activate'}
                  >
                    {u.accountActive ? <X size={14} /> : <Check size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
