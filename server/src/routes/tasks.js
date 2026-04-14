import express from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const VALID_PRIORITIES = new Set(['low', 'medium', 'high'])
const VALID_COLUMNS = new Set(['todo', 'in-progress', 'review', 'done'])

const SORT_COLUMNS = {
  created_at: 't.created_at',
  due_date: 't.due_date',
  title: 't.title',
  sort_order: 't.sort_order',
  priority: "FIELD(t.priority, 'high', 'medium', 'low')",
  column_id: "FIELD(t.column_id, 'todo', 'in-progress', 'review', 'done')",
}

const DEFAULT_LIMIT = 200
const MAX_LIMIT = 500

const TASK_SELECT = `
    t.id,
    t.title,
    t.description,
    t.priority,
    t.column_id,
    t.team_id,
    t.assignee_user_id,
    u.username AS assignee_name,
    u.avatar AS assignee_avatar,
    t.creator_user_id,
    t.max_petals,
    t.earned_petals,
    t.review_entered_at,
    t.frozen_petals_at_review,
    t.due_date,
    t.completed_at,
    t.created_at,
    t.sort_order`

const DEFAULT_ORDER_BY =
  "FIELD(t.column_id, 'todo', 'in-progress', 'review', 'done'), t.sort_order ASC, t.created_at ASC"

function parseCsv(value) {
  if (value == null) return null
  const items = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length > 0 ? items : null
}

function buildTaskFilters(query, userId) {
  const where = []
  const params = []

  const search = query.q?.trim()
  if (search) {
    const like = `%${search}%`
    where.push('(t.title LIKE ? OR t.description LIKE ? OR u.username LIKE ?)')
    params.push(like, like, like)
  }

  const priorities = parseCsv(query.priority)
  if (priorities) {
    const invalid = priorities.find((p) => !VALID_PRIORITIES.has(p))
    if (invalid) {
      return { error: `Invalid priority: ${invalid}` }
    }
    where.push(`t.priority IN (${priorities.map(() => '?').join(', ')})`)
    params.push(...priorities)
  }

  const columnIds = parseCsv(query.columnId)
  if (columnIds) {
    const invalid = columnIds.find((c) => !VALID_COLUMNS.has(c))
    if (invalid) {
      return { error: `Invalid column: ${invalid}` }
    }
    where.push(`t.column_id IN (${columnIds.map(() => '?').join(', ')})`)
    params.push(...columnIds)
  }

  if (query.assigneeUserId != null && query.assigneeUserId !== '') {
    if (query.assigneeUserId === 'me') {
      where.push('t.assignee_user_id = ?')
      params.push(userId)
    } else if (query.assigneeUserId === 'unassigned') {
      where.push('t.assignee_user_id IS NULL')
    } else {
      const assigneeId = Number(query.assigneeUserId)
      if (!Number.isInteger(assigneeId) || assigneeId <= 0) {
        return { error: 'Invalid assigneeUserId' }
      }
      where.push('t.assignee_user_id = ?')
      params.push(assigneeId)
    }
  }

  if (query.dueBefore) {
    where.push('t.due_date <= ?')
    params.push(query.dueBefore)
  }
  if (query.dueAfter) {
    where.push('t.due_date >= ?')
    params.push(query.dueAfter)
  }

  let orderBy = DEFAULT_ORDER_BY
  if (query.sort) {
    const [rawField, rawDir] = String(query.sort).split(':')
    const field = SORT_COLUMNS[rawField]
    if (!field) {
      return { error: `Invalid sort field: ${rawField}` }
    }
    const dir = (rawDir ?? 'asc').toLowerCase()
    if (dir !== 'asc' && dir !== 'desc') {
      return { error: 'Sort direction must be asc or desc' }
    }
    orderBy = `${field} ${dir.toUpperCase()}, t.sort_order ASC`
  }

  let limit = DEFAULT_LIMIT
  if (query.limit != null && query.limit !== '') {
    const parsed = Number(query.limit)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return { error: 'limit must be a positive integer' }
    }
    limit = Math.min(parsed, MAX_LIMIT)
  }

  let offset = 0
  if (query.offset != null && query.offset !== '') {
    const parsed = Number(query.offset)
    if (!Number.isInteger(parsed) || parsed < 0) {
      return { error: 'offset must be a non-negative integer' }
    }
    offset = parsed
  }

  return { where, params, orderBy, limit, offset }
}

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
         LIMIT ? OFFSET ?`,
      [...params, filters.limit, filters.offset]
    )

    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

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
         LIMIT ? OFFSET ?`,
      [...params, filters.limit, filters.offset]
    )

    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

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

    if (assigneeUserId) {
      const [assigneeMembership] = await pool.query(
        'SELECT id FROM memberships WHERE user_id = ? AND team_id = ?',
        [assigneeUserId, teamId]
      )

      if (assigneeMembership.length === 0) {
        return res.status(400).json({ error: 'Assignee must belong to this team' })
      }
    }

    const [maxOrderRows] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM tasks WHERE team_id = ? AND column_id = ?',
      [teamId, columnId]
    )

    const sortOrder = Number(maxOrderRows[0].maxOrder) + 1

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
        assigneeUserId || null,
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

router.get('/task/:taskId', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params

    const [rows] = await pool.query(
      `SELECT
                t.*,
                u.username AS assignee_name,
                u.avatar AS assignee_avatar
             FROM tasks t
             LEFT JOIN users u ON u.id = t.assignee_user_id
             WHERE t.id = ?`,
      [taskId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

router.put('/task/:taskId', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params
    const {
      title,
      description,
      priority,
      columnId,
      assigneeUserId,
      maxPetals,
      dueDate,
      earnedPetals,
      reviewEnteredAt,
      frozenPetalsAtReview,
      completedAt,
      sortOrder,
    } = req.body

    const [existingRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId])

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const existingTask = existingRows[0]

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, existingTask.team_id]
    )

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' })
    }

    const moveOnlyFields = [
      'columnId',
      'sortOrder',
      'reviewEnteredAt',
      'frozenPetalsAtReview',
      'completedAt',
      'earnedPetals',
    ]

    const editOnlyFields = [
      'title',
      'description',
      'priority',
      'assigneeUserId',
      'maxPetals',
      'dueDate',
    ]

    const hasMoveField = moveOnlyFields.some((field) => field in req.body)
    const hasEditField = editOnlyFields.some((field) => field in req.body)

    if (hasEditField && membership[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the team owner can edit task details' })
    }

    if (!hasMoveField && !hasEditField) {
      return res.status(400).json({ error: 'No valid fields provided for update' })
    }

    const nextTitle = title?.trim() ?? existingTask.title
    const nextDescription = description?.trim() ?? existingTask.description
    const nextPriority = priority ?? existingTask.priority
    const nextColumnId = columnId ?? existingTask.column_id
    const nextAssigneeUserId =
      assigneeUserId === undefined ? existingTask.assignee_user_id : assigneeUserId
    const nextMaxPetals = maxPetals ?? existingTask.max_petals
    const nextDueDate = dueDate === undefined ? existingTask.due_date : dueDate
    const nextEarnedPetals = earnedPetals === undefined ? existingTask.earned_petals : earnedPetals
    const nextReviewEnteredAt =
      reviewEnteredAt === undefined ? existingTask.review_entered_at : reviewEnteredAt
    const nextFrozenPetalsAtReview =
      frozenPetalsAtReview === undefined
        ? existingTask.frozen_petals_at_review
        : frozenPetalsAtReview
    const nextCompletedAt = completedAt === undefined ? existingTask.completed_at : completedAt
    const nextSortOrder = sortOrder ?? existingTask.sort_order

    if (!nextTitle) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    if (!nextDescription) {
      return res.status(400).json({ error: 'Task description is required' })
    }

    if (!VALID_PRIORITIES.has(nextPriority)) {
      return res.status(400).json({ error: 'Invalid priority' })
    }

    if (!VALID_COLUMNS.has(nextColumnId)) {
      return res.status(400).json({ error: 'Invalid column' })
    }

    if (nextAssigneeUserId) {
      const [assigneeMembership] = await pool.query(
        'SELECT id FROM memberships WHERE user_id = ? AND team_id = ?',
        [nextAssigneeUserId, existingTask.team_id]
      )

      if (assigneeMembership.length === 0) {
        return res.status(400).json({ error: 'Assignee must belong to this team' })
      }
    }

    await pool.query(
      `UPDATE tasks
             SET
                title = ?,
                description = ?,
                priority = ?,
                column_id = ?,
                assignee_user_id = ?,
                max_petals = ?,
                due_date = ?,
                earned_petals = ?,
                review_entered_at = ?,
                frozen_petals_at_review = ?,
                completed_at = ?,
                sort_order = ?
             WHERE id = ?`,
      [
        nextTitle,
        nextDescription,
        nextPriority,
        nextColumnId,
        nextAssigneeUserId,
        Number(nextMaxPetals),
        nextDueDate,
        nextEarnedPetals,
        nextReviewEnteredAt,
        nextFrozenPetalsAtReview,
        nextCompletedAt,
        Number(nextSortOrder),
        taskId,
      ]
    )

    const [updatedRows] = await pool.query(
      `SELECT
                t.*,
                u.username AS assignee_name,
                u.avatar AS assignee_avatar
             FROM tasks t
             LEFT JOIN users u ON u.id = t.assignee_user_id
             WHERE t.id = ?`,
      [taskId]
    )

    res.json(updatedRows[0])
  } catch (err) {
    next(err)
  }
})

router.delete('/task/:taskId', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params

    const [existingRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId])

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const existingTask = existingRows[0]

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, existingTask.team_id]
    )

    if (membership.length === 0 || membership[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the team owner can delete tasks' })
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId])

    res.json({ message: 'Task deleted successfully' })
  } catch (err) {
    next(err)
  }
})

export default router
