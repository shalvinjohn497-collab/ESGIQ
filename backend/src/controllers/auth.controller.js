import { asyncHandler } from '../middleware/error.middleware.js'
import { authService }  from '../services/auth.service.js'

export const authController = {

  register: asyncHandler(async (req, res) => {
    const { token, user } = await authService.register(req.body)
    res.status(201).json({ success: true, message: 'Account created', token, user })
  }),

  login: asyncHandler(async (req, res) => {
    const { token, user } = await authService.login(req.body)
    res.status(200).json({ success: true, message: 'Login successful', token, user })
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.userId)
    res.status(200).json({ success: true, user })
  }),
}