import express from 'express'
import pool from '../../db.js'
import { authenticate } from '../../middleware/auth.js'
import { VALID_PRIORITIES, VALID_COLUMNS } from './filters.js'

const router = express.Router()

/**
 * @openapi
 * /api/teams/task/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     operationId: getTask
 *     summary: Fetch a single task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The task
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/teams/task/{taskId}:
 *   put:
 *     tags: [Tasks]
 *     operationId: updateTask
 *     summary: Update a task's move-state and/or editable fields
 *     description: |
 *       Fields are split into two permission tiers:
 *
 *       - **Move fields** (`columnId`, `sortOrder`, `reviewEnteredAt`,
 *         `frozenPetalsAtReview`, `completedAt`, `earnedPetals`) — any team
 *         member may update these (used for drag-and-drop across columns and
 *         petal-award bookkeeping).
 *       - **Edit fields** (`title`, `description`, `priority`, `assigneeUserId`,
 *         `maxPetals`, `dueDate`) — owner only.
 *
 *       Sending any edit field without owner role yields 403 even if move
 *       fields are also present.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskUpdate' }
 *     responses:
 *       200:
 *         description: Updated task
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       400:
 *         description: Validation error (missing/invalid fields or no valid fields provided)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Caller is not a team member, or tried to edit owner-only fields
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

    if (nextAssigneeUserId != null) {
      if (!Number.isInteger(Number(nextAssigneeUserId)) || Number(nextAssigneeUserId) <= 0) {
        return res.status(400).json({ error: 'Invalid assigneeUserId' })
      }

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

/**
 * @openapi
 * /api/teams/task/{taskId}:
 *   delete:
 *     tags: [Tasks]
 *     operationId: deleteTask
 *     summary: Delete a task (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       403:
 *         description: Caller is not the team owner
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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
