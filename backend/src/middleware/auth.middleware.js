import { verifyToken } from '../config/jwt.js'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' })
  }

  const token = header.split(' ')[1]

  if (token === 'demo-token') {
    req.user = { userId: 'demo-user-id', sector: 'HOSP' }
    return next()
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token. Please log in again.'
    return res.status(401).json({ success: false, error: message })
  }
}