import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

const messages = []

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, appointmentType, message } = req.body
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Name, email, phone, and message are required' })
  }
  messages.push({ id: messages.length + 1, name, email, phone, appointmentType, message, createdAt: new Date().toISOString() })
  res.status(201).json({ success: true, message: 'Thank you! We will contact you soon.' })
}))

export default router
