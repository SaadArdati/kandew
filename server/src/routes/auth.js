import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

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
      return res.status(400).json({ message: 'Password must contain at least one special character.' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, name])

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email or username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    const token = jwt.sign(
      { id: result.insertId, username: name, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: result.insertId, username: name, email }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body

    const updates = []
    const values = []

    if (name) { updates.push('username = ?'); values.push(name) }
    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio) }
    if (avatar) { updates.push('avatar = ?'); values.push(avatar) }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    values.push(req.user.id)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

    const [users] = await pool.query('SELECT id, username, email, avatar, bio FROM users WHERE id = ?', [req.user.id])
    res.json(users[0])
  } catch (err) {
    next(err)
  }
})

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