import { Router } from 'express'
import { query } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.auth.userId])
  res.json(result.rows)
}))

router.get('/unread-count', requireAuth, asyncHandler(async (req, res) => {
  const result = await query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false', [req.auth.userId])
  res.json({ count: parseInt(result.rows[0].count) })
}))

router.put('/:id/read', requireAuth, asyncHandler(async (req, res) => {
  await query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.auth.userId])
  res.json({ success: true })
}))

router.put('/read-all', requireAuth, asyncHandler(async (req, res) => {
  await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.auth.userId])
  res.json({ success: true })
}))

export default router
