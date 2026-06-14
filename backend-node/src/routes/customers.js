import { Router } from 'express'
import { query } from '../config/database.js'
import { requireAuth, requireRole, requirePermission } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'

const router = Router()

router.get('/dashboard', requireAuth, requirePermission('account.view'), asyncHandler(async (req, res) => {
  const user = await query('SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.clerk_id = $1', [req.auth.userId])

  const requests = await query('SELECT * FROM service_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [req.auth.userId])

  const notifications = await query('SELECT * FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC LIMIT 5', [req.auth.userId])

  res.json({
    profile: user.rows[0] || null,
    recentRequests: requests.rows,
    notifications: notifications.rows,
  })
}))

router.put('/profile', requireAuth, asyncHandler(async (req, res) => {
  const { phone, address, city, state, pinCode, occupation } = req.body
  const result = await query(
    `UPDATE users SET phone = COALESCE($1, phone), address = COALESCE($2, address),
     city = COALESCE($3, city), state = COALESCE($4, state),
     pin_code = COALESCE($5, pin_code), occupation = COALESCE($6, occupation),
     updated_at = NOW()
     WHERE clerk_id = $7 RETURNING *`,
    [phone, address, city, state, pinCode, occupation, req.auth.userId]
  )
  res.json(result.rows[0])
}))

export default router
