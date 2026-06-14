import { Router } from 'express'
import { query } from '../config/database.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { auditLog } from '../middleware/audit.js'

const router = Router()

router.get('/roles', requireAuth, requirePermission('user.manage'), asyncHandler(async (req, res) => {
  const roles = await query('SELECT r.*, json_agg(json_build_object(\'id\', p.id, \'name\', p.name, \'description\', p.description)) as permissions FROM roles r LEFT JOIN role_permissions rp ON r.id = rp.role_id LEFT JOIN permissions p ON rp.permission_id = p.id GROUP BY r.id ORDER BY r.name')
  res.json(roles.rows)
}))

router.get('/permissions', requireAuth, requirePermission('user.manage'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM permissions ORDER BY name')
  res.json(result.rows)
}))

router.put('/roles/:id', requireAuth, requirePermission('user.manage'), auditLog('UPDATE_ROLE_PERMISSIONS', 'ROLE'), asyncHandler(async (req, res) => {
  const { permissionIds } = req.body
  if (!Array.isArray(permissionIds)) throw new AppError('permissionIds array is required', 400)

  await query('DELETE FROM role_permissions WHERE role_id = $1', [req.params.id])
  for (const permId of permissionIds) {
    await query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [req.params.id, permId])
  }

  const result = await query('SELECT * FROM roles WHERE id = $1', [req.params.id])
  res.json(result.rows[0])
}))

router.get('/sessions', requireAuth, requirePermission('audit.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM user_sessions ORDER BY created_at DESC')
  res.json(result.rows)
}))

router.get('/sessions/stats', requireAuth, requirePermission('audit.view'), asyncHandler(async (req, res) => {
  const [total, active, ips, users] = await Promise.all([
    query('SELECT COUNT(*) as count FROM user_sessions'),
    query('SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > NOW()'),
    query('SELECT COUNT(DISTINCT ip) as count FROM user_sessions WHERE ip IS NOT NULL'),
    query('SELECT COUNT(DISTINCT clerk_user_id) as count FROM user_sessions'),
  ])
  res.json({
    totalSessions: parseInt(total.rows[0].count),
    activeNow: parseInt(active.rows[0].count),
    uniqueIps: parseInt(ips.rows[0].count),
    uniqueUsers: parseInt(users.rows[0].count),
  })
}))

router.get('/login-attempts', requireAuth, requirePermission('audit.view'), asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM login_attempts ORDER BY created_at DESC LIMIT 100')
  res.json(result.rows)
}))

router.get('/login-attempts/stats', requireAuth, requirePermission('audit.view'), asyncHandler(async (req, res) => {
  const [todayTotal, todayFailed, recentAttempts, recentFailed] = await Promise.all([
    query("SELECT COUNT(*) as count FROM login_attempts WHERE created_at >= CURRENT_DATE"),
    query("SELECT COUNT(*) as count FROM login_attempts WHERE created_at >= CURRENT_DATE AND success = false"),
    query("SELECT COUNT(*) as count FROM login_attempts WHERE created_at >= NOW() - INTERVAL '1 hour'"),
    query("SELECT COUNT(*) as count FROM login_attempts WHERE created_at >= NOW() - INTERVAL '1 hour' AND success = false"),
  ])
  res.json({
    todayTotal: parseInt(todayTotal.rows[0].count),
    todayFailed: parseInt(todayFailed.rows[0].count),
    todaySuccess: parseInt(todayTotal.rows[0].count) - parseInt(todayFailed.rows[0].count),
    recentAttempts: parseInt(recentAttempts.rows[0].count),
    recentFailed: parseInt(recentFailed.rows[0].count),
  })
}))

router.get('/system/health', requireAuth, requirePermission('report.view'), asyncHandler(async (req, res) => {
  const [db, users, active] = await Promise.all([
    query('SELECT NOW() as time'),
    query('SELECT COUNT(*) as count FROM users'),
    query('SELECT COUNT(*) as count FROM users WHERE account_active = true'),
  ])
  res.json({
    status: 'UP',
    timestamp: db.rows[0].time,
    database: { status: 'UP', type: 'PostgreSQL' },
    totalUsers: parseInt(users.rows[0].count),
    activeUsers: parseInt(active.rows[0].count),
  })
}))

export default router
