import { Router } from 'express'
import { query } from '../config/database.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { auditLog } from '../middleware/audit.js'

const router = Router()

router.get('/', requireAuth, requirePermission('request.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM service_requests WHERE user_id = $1 ORDER BY created_at DESC', [req.auth.userId])
  res.json(result.rows)
}))

router.get('/all', requireAuth, requirePermission('request.manage'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM service_requests ORDER BY created_at DESC')
  res.json(result.rows)
}))

router.get('/:id', requireAuth, requirePermission('request.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM service_requests WHERE id = $1', [req.params.id])
  if (result.rows.length === 0) throw new AppError('Request not found', 404)
  res.json(result.rows[0])
}))

router.post('/', requireAuth, requirePermission('request.create'), auditLog('CREATE_REQUEST', 'SERVICE_REQUEST'), asyncHandler(async (req, res) => {
  const { type, description } = req.body
  if (!type || !description) throw new AppError('Type and description are required', 400)
  const result = await query(
    'INSERT INTO service_requests (user_id, type, description) VALUES ($1, $2, $3) RETURNING *',
    [req.auth.userId, type, description]
  )
  res.status(201).json(result.rows[0])
}))

router.put('/:id/status', requireAuth, requirePermission('request.approve'), auditLog('UPDATE_REQUEST_STATUS', 'SERVICE_REQUEST'), asyncHandler(async (req, res) => {
  const { status, assignedTo } = req.body
  const result = await query(
    'UPDATE service_requests SET status = COALESCE($1, status), assigned_to = COALESCE($2, assigned_to), updated_at = NOW() WHERE id = $3 RETURNING *',
    [status, assignedTo, req.params.id]
  )
  if (result.rows.length === 0) throw new AppError('Request not found', 404)
  res.json(result.rows[0])
}))

export default router
