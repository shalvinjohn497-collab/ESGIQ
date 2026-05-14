import express from 'express'
import cors    from 'cors'
import { errorHandler } from './middleware/error.middleware.js'
import authRoutes       from './routes/auth.routes.js'
import assessmentRoutes from './routes/assessment.routes.js'

export function createApp() {
  const app = express()

   app.use(cors({
    origin: [
      'http://localhost:3002',
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  }))
  app.use(express.json({ limit: '10mb' }))

  // Dev request logger
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV !== 'production')
      console.log(`${req.method} ${req.originalUrl}`)
    next()
  })

  // Health check
  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', ts: new Date().toISOString() })
  )

  // Routes — add more here as you build each phase
  app.use('/api/auth', authRoutes)
  app.use('/api/assessments', assessmentRoutes)

  // 404
  app.use((req, res) =>
    res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` })
  )

  // Global error handler — must be last
  app.use(errorHandler)

  return app
}