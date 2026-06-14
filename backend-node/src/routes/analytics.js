import { Router } from 'express'
import { query } from '../config/database.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

router.get('/summary', requireAuth, requirePermission('report.view'), asyncHandler(async (req, res) => {
  const [users, activeUsers, pendingApps, totalRequests, pendingRequests, resolvedRequests, usersThisMonth, requestsThisMonth] = await Promise.all([
    query('SELECT COUNT(*) as count FROM users'),
    query('SELECT COUNT(*) as count FROM users WHERE account_active = true'),
    query("SELECT COUNT(*) as count FROM users WHERE application_status = 'PENDING'"),
    query('SELECT COUNT(*) as count FROM service_requests'),
    query("SELECT COUNT(*) as count FROM service_requests WHERE status = 'PENDING'"),
    query("SELECT COUNT(*) as count FROM service_requests WHERE status IN ('RESOLVED', 'CLOSED')"),
    query("SELECT COUNT(*) as count FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)"),
    query("SELECT COUNT(*) as count FROM service_requests WHERE created_at >= date_trunc('month', CURRENT_DATE)"),
  ])

  const total = parseInt(totalRequests.rows[0].count)
  const resolved = parseInt(resolvedRequests.rows[0].count)
  const approvalRate = total > 0 ? Math.round((resolved / total) * 1000) / 10 : 0

  res.json({
    totalUsers: parseInt(users.rows[0].count),
    activeUsers: parseInt(activeUsers.rows[0].count),
    pendingApplications: parseInt(pendingApps.rows[0].count),
    totalRequests: total,
    pendingRequests: parseInt(pendingRequests.rows[0].count),
    resolvedRequests: resolved,
    usersThisMonth: parseInt(usersThisMonth.rows[0].count),
    requestsThisMonth: parseInt(requestsThisMonth.rows[0].count),
    approvalRate,
  })
}))

router.get('/request-volume', requireAuth, requirePermission('report.view'), asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM service_requests
     WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY DATE(created_at)
     ORDER BY date`
  )
  res.json(result.rows)
}))

router.get('/user-growth', requireAuth, requirePermission('report.view'), asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM users
     WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY DATE(created_at)
     ORDER BY date`
  )
  res.json(result.rows)
}))

export default router
