import { Router } from 'express'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { query } from '../config/database.js'

const router = Router()

router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body

    if (type === 'user.created') {
      await query(
        `INSERT INTO users (clerk_id, name, email, phone)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (clerk_id) DO UPDATE SET name = $2, email = $3, phone = $4`,
        [data.id, `${data.first_name || ''} ${data.last_name || ''}`.trim(), data.email_addresses?.[0]?.email_address, data.phone_numbers?.[0]?.phone_number]
      )
    }

    if (type === 'user.updated') {
      await query(
        `UPDATE users SET name = $1, email = $2, phone = $3 WHERE clerk_id = $4`,
        [`${data.first_name || ''} ${data.last_name || ''}`.trim(), data.email_addresses?.[0]?.email_address, data.phone_numbers?.[0]?.phone_number, data.id]
      )
    }

    if (type === 'user.deleted') {
      await query('DELETE FROM users WHERE clerk_id = $1', [data.id])
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error('[Webhook] Error:', err.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const session = await clerkClient.sessions.verifySession(token)
    const clerkUser = await clerkClient.users.getUser(session.userId)
    const dbUser = await query('SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.clerk_id = $1', [session.userId])

    res.json({
      id: session.userId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      imageUrl: clerkUser.imageUrl,
      role: dbUser.rows[0]?.role_name || 'MEMBER',
      profile: dbUser.rows[0] || null,
    })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
