import { Router } from 'express'

const router = Router()

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     operationId: login
 *     summary: Log in and receive a JWT
 *     description: |
 *       Not yet implemented — stub endpoint that currently responds 200 with a
 *       placeholder message. The real implementation will validate credentials
 *       against the `users` table and return a signed JWT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200:
 *         description: Stub response until the endpoint is implemented
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/LoginResponse'
 *                 - $ref: '#/components/schemas/Message'
 *       401:
 *         description: Invalid credentials (once implemented)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
