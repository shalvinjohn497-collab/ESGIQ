import jwt from 'jsonwebtoken'

const SECRET = 'esgiq_super_secret_jwt_key_minimum32chars'

export function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}