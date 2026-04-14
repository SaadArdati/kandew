import express from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * @openapi
 * tags:
 *   - name: Teams
 *     description: Team management and membership
 */

/**
 * @openapi
 * /api/teams:
 *   get:
 *     tags: [Teams]
 *     operationId: listMyTeams
 *     summary: List teams the authenticated user belongs to
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of teams with the caller's role on each
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Team' }
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const [teams] = await pool.query(
      `SELECT t.*, m.role AS current_user_role
             FROM teams t
             INNER JOIN memberships m ON t.id = m.team_id
             WHERE m.user_id = ?`,
      [req.user.id]
    )
    res.json(teams)
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/{id}:
 *   get:
 *     tags: [Teams]
 *     operationId: getTeam
 *     summary: Get a single team (must be a member)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Team with the caller's role
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Team' }
 *       404:
 *         description: Team not found or caller is not a member
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const [teams] = await pool.query(
      `SELECT t.*, m.role AS current_user_role
             FROM teams t
             INNER JOIN memberships m ON t.id = m.team_id
             WHERE t.id = ? AND m.user_id = ?`,
      [req.params.id, req.user.id]
    )

    if (teams.length === 0) {
      return res.status(404).json({ error: 'Team not found' })
    }

    res.json(teams[0])
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams:
 *   post:
 *     tags: [Teams]
 *     operationId: createTeam
 *     summary: Create a team (caller becomes owner)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TeamCreate' }
 *     responses:
 *       201:
 *         description: Created team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Team' }
 *       400:
 *         description: Missing or invalid team name
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, icon } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' })
    }

    const [result] = await pool.query(
      'INSERT INTO teams (name, icon, creator_user_id) VALUES (?, ?, ?)',
      [name.trim(), icon || null, req.user.id]
    )

    await pool.query('INSERT INTO memberships (user_id, team_id, role) VALUES (?, ?, ?)', [
      req.user.id,
      result.insertId,
      'owner',
    ])

    const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [result.insertId])
    res.status(201).json(teams[0])
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/{id}:
 *   put:
 *     tags: [Teams]
 *     operationId: updateTeam
 *     summary: Update a team (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TeamUpdate' }
 *     responses:
 *       200:
 *         description: Updated team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Team' }
 *       400:
 *         description: No fields provided for update
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Caller lacks owner/admin role on this team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { name, icon, petal_value } = req.body

    const [membership] = await pool.query(
      `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
      [req.user.id, req.params.id]
    )

    if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
      return res.status(403).json({ error: 'Not authorized to edit this team' })
    }

    const updates = []
    const values = []

    if (name) {
      updates.push('name = ?')
      values.push(name.trim())
    }
    if (icon !== undefined) {
      updates.push('icon = ?')
      values.push(icon)
    }
    if (petal_value !== undefined) {
      updates.push('petal_value = ?')
      values.push(petal_value)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    values.push(req.params.id)
    await pool.query(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`, values)

    const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [req.params.id])
    res.json(teams[0])
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/{id}:
 *   delete:
 *     tags: [Teams]
 *     operationId: deleteTeam
 *     summary: Delete a team (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Team deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       403:
 *         description: Caller is not the owner
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const [membership] = await pool.query(
      `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
      [req.user.id, req.params.id]
    )

    if (membership.length === 0 || membership[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the owner can delete this team' })
    }

    await pool.query('DELETE FROM teams WHERE id = ?', [req.params.id])
    res.json({ message: 'Team deleted successfully' })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/{id}/members:
 *   get:
 *     tags: [Teams]
 *     operationId: listTeamMembers
 *     summary: List members of a team with petal and money earnings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Members with petal and money earnings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Member' }
 *       403:
 *         description: Caller is not a member of this team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id/members', authenticate, async (req, res, next) => {
  try {
    const [membership] = await pool.query(
      `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
      [req.user.id, req.params.id]
    )

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' })
    }

    const [members] = await pool.query(
      `SELECT u.id, u.username, u.email, u.avatar, m.role,
                    COALESCE(SUM(t.earned_petals), 0) as petals_earned
             FROM memberships m
             INNER JOIN users u ON m.user_id = u.id
             LEFT JOIN tasks t ON t.assignee_user_id = u.id AND t.team_id = ? AND t.column_id = 'done'
             WHERE m.team_id = ?
             GROUP BY u.id, u.username, u.email, u.avatar, m.role`,
      [req.params.id, req.params.id]
    )

    const [team] = await pool.query('SELECT petal_value FROM teams WHERE id = ?', [req.params.id])
    const petalValue = team[0]?.petal_value || 1

    const membersWithEarnings = members.map((m) => ({
      ...m,
      money_earned: (m.petals_earned * petalValue).toFixed(2),
    }))

    res.json(membersWithEarnings)
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/{id}/members:
 *   post:
 *     tags: [Teams]
 *     operationId: inviteTeamMember
 *     summary: Invite an existing user to the team by email (owner or admin only)
 *     description: |
 *       Looks up the user by email and inserts a `memberships` row with the
 *       `member` role. The user must already exist in the system.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InviteMemberRequest' }
 *     responses:
 *       201:
 *         description: Member invited
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       400:
 *         description: Missing email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Caller lacks owner/admin role on this team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No user registered with that email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: User is already a member of this team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:id/members', authenticate, async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const [membership] = await pool.query(
      `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
      [req.user.id, req.params.id]
    )

    if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
      return res.status(403).json({ error: 'Not authorized to invite members' })
    }

    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email])

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userId = users[0].id

    const [existing] = await pool.query(
      'SELECT id FROM memberships WHERE user_id = ? AND team_id = ?',
      [userId, req.params.id]
    )

    if (existing.length > 0) {
      return res.status(409).json({ error: 'User is already a member' })
    }

    await pool.query('INSERT INTO memberships (user_id, team_id, role) VALUES (?, ?, ?)', [
      userId,
      req.params.id,
      'member',
    ])

    res.status(201).json({ message: 'Member invited successfully' })
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/{id}/members/{memberId}:
 *   delete:
 *     tags: [Teams]
 *     operationId: removeTeamMember
 *     summary: Remove a member from the team (owner or admin only)
 *     description: The team owner cannot be removed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Team id
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: integer }
 *         description: User id of the member to remove
 *     responses:
 *       200:
 *         description: Member removed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       403:
 *         description: Caller lacks owner/admin role, or target is the team owner
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Target user is not a member of this team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id/members/:memberId', authenticate, async (req, res, next) => {
  try {
    const [membership] = await pool.query(
      `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
      [req.user.id, req.params.id]
    )

    if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
      return res.status(403).json({ error: 'Not authorized to kick members' })
    }

    const [targetMembership] = await pool.query(
      `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
      [req.params.memberId, req.params.id]
    )

    if (targetMembership.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }

    if (targetMembership[0].role === 'owner') {
      return res.status(403).json({ error: 'Cannot kick the owner' })
    }

    await pool.query('DELETE FROM memberships WHERE user_id = ? AND team_id = ?', [
      req.params.memberId,
      req.params.id,
    ])

    res.json({ message: 'Member removed successfully' })
  } catch (err) {
    next(err)
  }
})

export default router
