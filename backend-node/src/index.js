import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'

import { corsConfig } from './config/cors.js'
import { connectDB } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/auth.js'
import requestRoutes from './routes/requests.js'
import documentRoutes from './routes/documents.js'
import notificationRoutes from './routes/notifications.js'
import customerRoutes from './routes/customers.js'
import staffRoutes from './routes/staff.js'
import adminRoutes from './routes/admin.js'
import superAdminRoutes from './routes/superAdmin.js'
import visitorRoutes from './routes/visitors.js'
import analyticsRoutes from './routes/analytics.js'
import contactRoutes from './routes/contact.js'

const app = express()
const PORT = process.env.PORT || 8080

app.use(helmet())
app.use(corsConfig)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

app.use('/api/auth', authRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/visitor', visitorRoutes)
app.use('/api/admin/analytics', analyticsRoutes)
app.use('/api/contact', contactRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

async function start() {
  try {
    await connectDB()
    createServer(app).listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
    })
  } catch (err) {
    console.error('[Server] Failed to start:', err.message)
    process.exit(1)
  }
}

start()
