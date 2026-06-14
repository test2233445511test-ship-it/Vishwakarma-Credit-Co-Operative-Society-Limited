import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { File, Download, FileText, Image, FileSpreadsheet } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function DocumentList() {
  const { getToken } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = await getToken()
        const res = await fetch(apiUrl('/documents'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setDocuments(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [getToken])

  const fileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image size={20} />
    if (type?.includes('spreadsheet') || type?.includes('excel')) return <FileSpreadsheet size={20} />
    if (type === 'application/pdf') return <FileText size={20} />
    return <File size={20} />
  }

  if (loading) return <div className="text-center py-8"><div className="spinner" /></div>

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <File size={48} color="var(--text-light)" />
        <h3>No Documents</h3>
        <p>Upload documents to attach to your requests.</p>
      </div>
    )
  }

  return (
    <div className="document-list">
      {documents.map(doc => (
        <div key={doc.id} className="document-card">
          <div className="doc-icon">{fileIcon(doc.fileType)}</div>
          <div className="doc-info">
            <span className="doc-name">{doc.fileName}</span>
            <span className="doc-meta">
              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB &middot; {new Date(doc.uploadedAt).toLocaleDateString()}
            </span>
          </div>
          <a
            href={apiUrl(`/documents/download/${doc.id}`)}
            className="btn btn-outline btn-sm"
            download
          >
            <Download size={16} />
          </a>
        </div>
      ))}
    </div>
  )
}
