import { Router } from 'express'
import { query } from '../config/database.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { auditLog } from '../middleware/audit.js'

const router = Router()

router.get('/users', requireAuth, requirePermission('user.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC')
  res.json(result.rows)
}))

router.get('/users/pending', requireAuth, requirePermission('user.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM users WHERE application_status = $1 ORDER BY created_at DESC', ['PENDING'])
  res.json(result.rows)
}))

router.put('/users/:id/role', requireAuth, requirePermission('user.manage'), auditLog('UPDATE_USER_ROLE', 'USER'), asyncHandler(async (req, res) => {
  const { role } = req.body
  const roleResult = await query('SELECT id FROM roles WHERE name = $1', [role])
  if (roleResult.rows.length === 0) throw new AppError('Invalid role', 400)

  const result = await query('UPDATE users SET role_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [roleResult.rows[0].id, req.params.id])
  if (result.rows.length === 0) throw new AppError('User not found', 404)
  res.json(result.rows[0])
}))

router.put('/users/:id/status', requireAuth, requirePermission('user.manage'), auditLog('UPDATE_USER_STATUS', 'USER'), asyncHandler(async (req, res) => {
  const { active } = req.body
  const result = await query('UPDATE users SET account_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [active, req.params.id])
  if (result.rows.length === 0) throw new AppError('User not found', 404)
  res.json(result.rows[0])
}))

router.get('/requests', requireAuth, requirePermission('request.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM service_requests ORDER BY created_at DESC')
  res.json(result.rows)
}))

router.get('/requests/pending', requireAuth, requirePermission('request.view'), asyncHandler(async (req, res) => {
  const result = await query("SELECT * FROM service_requests WHERE status = 'PENDING' ORDER BY created_at DESC")
  res.json(result.rows)
}))

router.put('/requests/:id/status', requireAuth, requirePermission('request.approve'), auditLog('UPDATE_REQUEST_STATUS', 'SERVICE_REQUEST'), asyncHandler(async (req, res) => {
  const { status, assignedTo } = req.body
  const result = await query(
    'UPDATE service_requests SET status = COALESCE($1, status), assigned_to = COALESCE($2, assigned_to), updated_at = NOW() WHERE id = $3 RETURNING *',
    [status, assignedTo, req.params.id]
  )
  if (result.rows.length === 0) throw new AppError('Request not found', 404)
  res.json(result.rows[0])
}))

export default router
