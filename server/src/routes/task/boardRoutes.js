import express from 'express'
import pool from '../../db.js'
import { authenticate } from '../../middleware/auth.js'
import {
  VALID_PRIORITIES,
  VALID_COLUMNS,
  TASK_SELECT,
  buildTaskFilters,
} from './filters.js'

const router = express.Router()

/**
 * @openapi
 * tags:
 *   - name: Tasks
 *     description: Team task board operations
 */

/**
 * @openapi
 * /api/teams/{id}/tasks:
 *   get:
 *     tags: [Tasks]
 *     operationId: listTeamTasks
 *     summary: List tasks for a team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Team id
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search across title, description, assignee username
 *       - in: query
 *         name: priority
 *         schema:
 *           type: array
 *           items: { type: string, enum: [low, medium, high] }
 *         style: form
 *         explode: true
 *         description: Repeat the key for multiple values — `?priority=high&priority=medium`.
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: array
 *           items: { type: string, enum: [todo, in-progress, review, done] }
 *         style: form
 *         explode: true
 *         description: Repeat the key for multiple values — `?columnId=todo&columnId=in-progress`.
 *       - in: query
 *         name: assigneeUserId
 *         schema: { type: string }
 *         description: Numeric user id, "me", or "unassigned"
 *       - in: query
 *         name: dueBefore
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dueAfter
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: "field:direction (e.g. due_date:desc)"
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 200, maximum: 500 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Task' }
 *       400:
 *         description: Invalid query parameter
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Not a team member
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id/tasks', authenticate, async (req, res, next) => {
  try {
    const teamId = req.params.id

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, teamId]
    )

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' })
    }

    const filters = buildTaskFilters(req.query, req.user.id)
    if (filters.error) {
      return res.status(400).json({ error: filters.error })
    }

    const whereClauses = ['t.team_id = ?', ...filters.where]
    const params = [teamId, ...filters.params]

    const [tasks] = await pool.query(
      `SELECT ${TASK_SELECT}
         FROM tasks t
         LEFT JOIN users u ON u.id = t.assignee_user_id
         WHERE ${whereClauses.join(' AND ')}
         ORDER BY ${filters.orderBy}
         LIMIT ${filters.limit} OFFSET ${filters.offset}`,
      params
    )

    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/tasks/mine:
 *   get:
 *     tags: [Tasks]
 *     operationId: listMyTasks
 *     summary: List tasks across all teams the caller belongs to
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema: { type: integer }
 *         description: Restrict results to a single team
 *     responses:
 *       200:
 *         description: Array of tasks, each with team_name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Task'
 *                   - type: object
 *                     properties:
 *                       team_name: { type: string }
 *       400:
 *         description: Invalid query parameter
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/tasks/mine', authenticate, async (req, res, next) => {
  try {
    const filters = buildTaskFilters(req.query, req.user.id)
    if (filters.error) {
      return res.status(400).json({ error: filters.error })
    }

    const whereClauses = [
      't.team_id IN (SELECT team_id FROM memberships WHERE user_id = ?)',
      ...filters.where,
    ]
    const params = [req.user.id, ...filters.params]

    if (req.query.teamId) {
      const teamId = Number(req.query.teamId)
      if (!Number.isInteger(teamId) || teamId <= 0) {
        return res.status(400).json({ error: 'Invalid teamId' })
      }
      whereClauses.push('t.team_id = ?')
      params.push(teamId)
    }

    const [tasks] = await pool.query(
      `SELECT ${TASK_SELECT}, tm.name AS team_name
         FROM tasks t
         LEFT JOIN users u ON u.id = t.assignee_user_id
         INNER JOIN teams tm ON tm.id = t.team_id
         WHERE ${whereClauses.join(' AND ')}
         ORDER BY ${filters.orderBy}
         LIMIT ${filters.limit} OFFSET ${filters.offset}`,
      params
    )

    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/teams/{id}/tasks:
 *   post:
 *     tags: [Tasks]
 *     operationId: createTask
 *     summary: Create a task in a team (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Team id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskCreate' }
 *     responses:
 *       201:
 *         description: Created task
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Only the team owner can create tasks
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:id/tasks', authenticate, async (req, res, next) => {
  try {
    const teamId = req.params.id
    const {
      title,
      description,
      priority = 'medium',
      columnId = 'todo',
      assigneeUserId = null,
      maxPetals = 5,
      dueDate = null,
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Task description is required' })
    }

    if (!VALID_PRIORITIES.has(priority)) {
      return res.status(400).json({ error: 'Invalid priority' })
    }

    if (!VALID_COLUMNS.has(columnId)) {
      return res.status(400).json({ error: 'Invalid column' })
    }

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, teamId]
    )

    if (membership.length === 0 || membership[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the team owner can create tasks' })
    }

    let assigneeId = null
    if (assigneeUserId != null && assigneeUserId !== '') {
      assigneeId = Number(assigneeUserId)
      if (!Number.isInteger(assigneeId) || assigneeId <= 0) {
        return res.status(400).json({ error: 'Invalid assigneeUserId' })
      }

      const [assigneeMembership] = await pool.query(
        'SELECT id FROM memberships WHERE user_id = ? AND team_id = ?',
        [assigneeId, teamId]
      )

      if (assigneeMembership.length === 0) {
        return res.status(400).json({ error: 'Assignee must belong to this team' })
      }
    }

    const [maxOrderRows] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM tasks WHERE team_id = ? AND column_id = ?',
      [teamId, columnId]
    )

    const sortOrder = Number(maxOrderRows[0]['max_order']) + 1

    const [result] = await pool.query(
      `INSERT INTO tasks (
                title,
                description,
                priority,
                column_id,
                team_id,
                assignee_user_id,
                creator_user_id,
                max_petals,
                due_date,
                sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        priority,
        columnId,
        teamId,
        assigneeId,
        req.user.id,
        Number(maxPetals),
        dueDate || null,
        sortOrder,
      ]
    )

    const [createdRows] = await pool.query(
      `SELECT ${TASK_SELECT}
         FROM tasks t
         LEFT JOIN users u ON u.id = t.assignee_user_id
         WHERE t.id = ?`,
      [result.insertId]
    )

    res.status(201).json(createdRows[0])
  } catch (err) {
    next(err)
  }
})

export default router
