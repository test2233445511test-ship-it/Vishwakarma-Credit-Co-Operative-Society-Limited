import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { query } from '../config/database.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'

const router = Router()
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new AppError('File type not allowed. Allowed: PDF, JPEG, PNG, DOC, DOCX', 400))
    }
    cb(null, true)
  },
})

router.post('/upload', requireAuth, requirePermission('document.upload'), asyncHandler(async (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') throw new AppError('File too large (max 10MB)', 400)
      throw err
    }
    if (!req.file) throw new AppError('No file provided', 400)

    const result = await query(
      'INSERT INTO documents (user_id, file_name, file_path, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.auth.userId, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size]
    )

    res.status(201).json(result.rows[0])
  })
}))

router.get('/', requireAuth, requirePermission('document.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [req.auth.userId])
  res.json(result.rows)
}))

router.get('/download/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM documents WHERE id = $1', [req.params.id])
  if (result.rows.length === 0) throw new AppError('Document not found', 404)

  const doc = result.rows[0]
  if (doc.user_id !== req.auth.userId) {
    const roleCheck = await query('SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.clerk_id = $1', [req.auth.userId])
    if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(roleCheck.rows[0]?.name)) {
      throw new AppError('Access denied', 403)
    }
  }

  const filePath = path.join(UPLOAD_DIR, doc.file_path)
  if (!fs.existsSync(filePath)) throw new AppError('File not found on disk', 404)

  res.download(filePath, doc.file_name)
}))

export default router
