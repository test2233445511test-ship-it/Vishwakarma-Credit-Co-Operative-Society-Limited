import { Router } from 'express'
import { query } from '../config/database.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'

const router = Router()

router.get('/requests', requireAuth, requirePermission('request.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM service_requests WHERE assigned_to = $1 ORDER BY created_at DESC', [req.auth.userId])
  res.json(result.rows)
}))

router.get('/requests/:id', requireAuth, requirePermission('request.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM service_requests WHERE id = $1 AND assigned_to = $2', [req.params.id, req.auth.userId])
  if (result.rows.length === 0) throw new AppError('Request not found or not assigned to you', 404)
  res.json(result.rows[0])
}))

router.put('/requests/:id/status', requireAuth, requirePermission('request.approve'), asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
    throw new AppError('Invalid status', 400)
  }
  const result = await query(
    'UPDATE service_requests SET status = $1, updated_at = NOW() WHERE id = $2 AND assigned_to = $3 RETURNING *',
    [status, req.params.id, req.auth.userId]
  )
  if (result.rows.length === 0) throw new AppError('Request not found or not assigned to you', 404)
  res.json(result.rows[0])
}))

router.put('/requests/:id/notes', requireAuth, requirePermission('request.approve'), asyncHandler(async (req, res) => {
  const { staffNotes } = req.body
  const result = await query(
    'UPDATE service_requests SET staff_notes = $1, updated_at = NOW() WHERE id = $2 AND assigned_to = $3 RETURNING *',
    [staffNotes, req.params.id, req.auth.userId]
  )
  if (result.rows.length === 0) throw new AppError('Request not found or not assigned to you', 404)
  res.json(result.rows[0])
}))

export default router
