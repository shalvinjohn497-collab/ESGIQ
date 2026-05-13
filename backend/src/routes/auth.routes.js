import { Router } from 'express'
import Joi        from 'joi'
import { authController }     from '../controllers/auth.controller.js'
import { authMiddleware }     from '../middleware/auth.middleware.js'
import { validateRequest }    from '../middleware/validation.middleware.js'

const router = Router()

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(60).trim().required(),
  email:    Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).required(),
  orgName:  Joi.string().max(100).allow('').optional(),
  sector:   Joi.string().optional(),
})

const loginSchema = Joi.object({
  email:    Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
})

router.post('/register', validateRequest(registerSchema), authController.register)
router.post('/login',    validateRequest(loginSchema),    authController.login)
router.get('/me',        authMiddleware,                  authController.getMe)

export default router