import User from '../models/User.model.js'
import { signToken } from '../config/jwt.js'

export const authService = {

  async register({ name, email, password, orgName = '', sector = 'Healthcare' }) {
    const existing = await User.findOne({ email })
    if (existing) {
      const err = new Error('An account with this email already exists')
      err.status = 409
      throw err
    }
    const user  = await User.create({ name, email, password, orgName, sector })
    const token = signToken(user)
    return { token, user }
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.isActive) {
      const err = new Error('Invalid email or password')
      err.status = 401
      throw err
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      const err = new Error('Invalid email or password')
      err.status = 401
      throw err
    }
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).exec()
    const token = signToken(user)
    user.password = undefined
    return { token, user }
  },

  async getMe(userId) {
    const user = await User.findById(userId)
    if (!user || !user.isActive) {
      const err = new Error('User not found')
      err.status = 404
      throw err
    }
    return user
  },
}