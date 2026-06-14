import { query } from '../config/database.js'

export function auditLog(action, resource) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res)
    res.json = function (body) {
      const userId = req.auth?.userId || 'anonymous'
      const ip = req.ip || req.connection?.remoteAddress || ''

      query(
        `INSERT INTO audit_logs (user_id, action, resource, details, ip)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, action, resource, `${req.method} ${req.originalUrl}`, ip]
      ).catch(err => console.error('[Audit] Log failed:', err.message))

      return originalJson(body)
    }
    next()
  }
}
