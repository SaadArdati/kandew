import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and account profile
 */

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     operationId: signup
 *     summary: Register a new user and receive a bearer token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SignupRequest' }
 *     responses:
 *       201:
 *         description: User created; JWT returned. Client should call `GET /api/auth/me` to fetch the profile.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenResponse' }
 *       400:
 *         description: Missing field or password fails complexity checks
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' })
    }

    if (!/[a-zA-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one letter.' })
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number.' })
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res
        .status(400)
        .json({ message: 'Password must contain at least one special character.' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [
      email,
      name,
    ])

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email or username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.status(201).json({ token })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     operationId: login
 *     summary: Exchange credentials for a bearer token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200:
 *         description: Credentials valid; JWT returned.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenResponse' }
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const [users] = await pool.query('SELECT id, password FROM users WHERE email = ?', [email])

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({ token })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     operationId: getMe
 *     summary: Get the authenticated user's full profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile for the user identified by the bearer token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserProfile' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Token is valid but the user record no longer exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, avatar, bio FROM users WHERE id = ?',
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(users[0])
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     operationId: logout
 *     summary: Acknowledge logout (server is stateless; client should discard its token)
 *     description: |
 *       Tokens are not revoked server-side — this endpoint exists as a polite handshake.
 *       Security comes from the client deleting its stored JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acknowledged
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     operationId: updateProfile
 *     summary: Update the authenticated user's profile
 *     description: |
 *       Any subset of { name, bio, avatar } may be sent. Fields omitted from the body are untouched.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProfileUpdate' }
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserProfile' }
 *       400:
 *         description: Body contained no updatable fields
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body

    const updates = []
    const values = []

    if (name) {
      updates.push('username = ?')
      values.push(name)
    }
    if (bio !== undefined) {
      updates.push('bio = ?')
      values.push(bio)
    }
    if (avatar) {
      updates.push('avatar = ?')
      values.push(avatar)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    values.push(req.user.id)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

    const [users] = await pool.query(
      'SELECT id, username, email, avatar, bio FROM users WHERE id = ?',
      [req.user.id]
    )
    res.json(users[0])
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     operationId: forgotPassword
 *     summary: Initiate a password reset flow (stubbed)
 *     description: |
 *       Currently returns the same generic acknowledgement whether or not the email matches a
 *       registered user (to prevent account enumeration). No email is actually sent and no reset
 *       token is issued — this endpoint is a placeholder pending a real reset flow.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ForgotPasswordRequest' }
 *     responses:
 *       200:
 *         description: Generic acknowledgement (does not reveal whether the email is registered)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       400:
 *         description: Missing email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email])

    if (users.length === 0) {
      return res.json({ message: 'If this email exists, a reset link has been sent.' })
    }

    res.json({ message: 'If this email exists, a reset link has been sent.' })
  } catch (err) {
    next(err)
  }
})

export default router
