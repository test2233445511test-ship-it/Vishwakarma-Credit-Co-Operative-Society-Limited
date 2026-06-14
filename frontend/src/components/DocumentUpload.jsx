import { useState, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Upload, File, X, Loader } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function DocumentUpload({ requestId, onUpload }) {
  const { getToken } = useAuth()
  const fileInput = useRef(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const allowedTypes = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }
    if (!allowedTypes.includes(f.type)) {
      setError('Allowed types: PDF, JPEG, PNG, DOC, DOCX')
      return
    }
    setError('')
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')

    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('file', file)
      if (requestId) formData.append('requestId', requestId)

      const res = await fetch(apiUrl('/documents/upload'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        setFile(null)
        fileInput.current.value = ''
        onUpload?.()
      } else {
        const data = await res.json()
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="document-upload">
      {error && <div className="form-error">{error}</div>}

      <input
        ref={fileInput}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        style={{ display: 'none' }}
      />

      {!file ? (
        <button type="button" className="upload-zone" onClick={() => fileInput.current?.click()}>
          <Upload size={32} />
          <span>Click to upload a document</span>
          <span className="upload-hint">PDF, JPEG, PNG, DOC, DOCX up to 10MB</span>
        </button>
      ) : (
        <div className="file-preview">
          <File size={24} />
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <button className="btn-icon" onClick={() => { setFile(null); fileInput.current.value = '' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {file && (
        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader size={18} className="spin" /> : <Upload size={18} />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      )}
    </div>
  )
}
