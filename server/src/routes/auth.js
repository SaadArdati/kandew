import { Router } from 'express'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    // TODO: Find user by email in database
    // TODO: Compare password with bcrypt
    // TODO: Generate JWT token
    // TODO: Return token

    res.json({ message: 'Login endpoint - not yet implemented' })
  } catch (err) {
    next(err)
  }
})

export default router
