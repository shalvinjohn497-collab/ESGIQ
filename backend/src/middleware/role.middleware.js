export function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ success: false, error: 'Not authenticated' })

    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({
        success:  false,
        error:    'You do not have permission for this action',
        required: allowedRoles,
        current:  req.user.role,
      })

    next()
  }
}