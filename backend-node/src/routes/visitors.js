import { Router } from 'express'

const router = Router()

const visits = []

router.post('/track', (req, res) => {
  const { page, referrer } = req.body
  visits.push({
    page: page || '/',
    referrer: referrer || '',
    ip: req.ip || req.connection?.remoteAddress || '',
    timestamp: new Date().toISOString(),
  })
  res.json({ tracked: true })
})

router.get('/today', (req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  const count = visits.filter(v => v.timestamp.startsWith(today)).length
  res.json({ count })
})

router.get('/details', (req, res) => {
  res.json(visits.slice(-100))
})

export default router
