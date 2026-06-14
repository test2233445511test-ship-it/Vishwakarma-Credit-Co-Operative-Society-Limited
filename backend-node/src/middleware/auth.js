import { clerkClient } from '@clerk/clerk-sdk-node'
import { query } from '../config/database.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1]
    const session = await clerkClient.sessions.verifySession(token)

    req.auth = {
      userId: session.userId,
      sessionId: session.id,
    }

    const userResult = await query('SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.clerk_id = $1', [session.userId])
    req.user = userResult.rows[0] || null

    next()
  } catch (err) {
    console.error('[Auth] Verification failed:', err.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    req.auth = null
    req.user = null
    return next()
  }

  return requireAuth(req, res, next)
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

export async function requirePermission(permissionName) {
  return async (req, res, next) => {
    if (!req.user?.role_name) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await query(
      `SELECT 1 FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = $1 AND p.name = $2`,
      [req.user.role_name, permissionName]
    )

    if (result.rows.length === 0) {
      return res.status(403).json({ error: `Missing permission: ${permissionName}` })
    }

    next()
  }
}
