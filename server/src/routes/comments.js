import express from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * @openapi
 * tags:
 *   - name: Comments
 *     description: Task comments (any team member can post; only the author can edit or delete)
 */

/**
 * @openapi
 * /api/tasks/{taskId}/comments:
 *   get:
 *     tags: [Comments]
 *     operationId: listTaskComments
 *     summary: List comments on a task, oldest first
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Array of comments ordered by created_at ASC
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Comment' }
 *       403:
 *         description: Caller is not a member of the task's team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/tasks/:taskId/comments', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params

    const [taskRows] = await pool.query('SELECT team_id FROM tasks WHERE id = ?', [taskId])

    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const teamId = taskRows[0].team_id

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, teamId]
    )

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' })
    }

    const [comments] = await pool.query(
      `SELECT c.id,
              c.task_id,
              c.author_user_id,
              u.username AS author_name,
              u.avatar   AS author_avatar,
              c.body,
              c.created_at,
              c.updated_at
       FROM comments c
              INNER JOIN users u ON u.id = c.author_user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at `,
      [taskId]
    )

    res.json(comments)
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/tasks/{taskId}/comments:
 *   post:
 *     tags: [Comments]
 *     operationId: createTaskComment
 *     summary: Add a comment to a task
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
 *           schema: { $ref: '#/components/schemas/CommentBody' }
 *     responses:
 *       201:
 *         description: Created comment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Comment' }
 *       400:
 *         description: Empty or missing comment body
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Caller is not a member of the task's team
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/tasks/:taskId/comments', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params
    const { body } = req.body

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Comment body is required' })
    }

    const [taskRows] = await pool.query('SELECT team_id FROM tasks WHERE id = ?', [taskId])

    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const teamId = taskRows[0].team_id

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, teamId]
    )

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' })
    }

    const [result] = await pool.query(
      `INSERT INTO comments (task_id, author_user_id, body)
             VALUES (?, ?, ?)`,
      [taskId, req.user.id, body.trim()]
    )

    const [createdRows] = await pool.query(
      `SELECT
                c.id,
                c.task_id,
                c.author_user_id,
                u.username AS author_name,
                u.avatar AS author_avatar,
                c.body,
                c.created_at,
                c.updated_at
             FROM comments c
             INNER JOIN users u ON u.id = c.author_user_id
             WHERE c.id = ?`,
      [result.insertId]
    )

    res.status(201).json(createdRows[0])
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/comments/{commentId}:
 *   put:
 *     tags: [Comments]
 *     operationId: updateComment
 *     summary: Edit a comment (author only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CommentBody' }
 *     responses:
 *       200:
 *         description: Updated comment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Comment' }
 *       400:
 *         description: Empty or missing comment body
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Caller is not a team member, or is not the comment author
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/comments/:commentId', authenticate, async (req, res, next) => {
  try {
    const { commentId } = req.params
    const { body } = req.body

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Comment body is required' })
    }

    const [existingRows] = await pool.query(
      `SELECT c.*, t.team_id
             FROM comments c
             INNER JOIN tasks t ON t.id = c.task_id
             WHERE c.id = ?`,
      [commentId]
    )

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    const existingComment = existingRows[0]

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, existingComment.team_id]
    )

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' })
    }

    if (existingComment.author_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the comment author can edit this comment' })
    }

    await pool.query(
      `UPDATE comments
             SET body = ?, updated_at = NOW()
             WHERE id = ?`,
      [body.trim(), commentId]
    )

    const [updatedRows] = await pool.query(
      `SELECT
                c.id,
                c.task_id,
                c.author_user_id,
                u.username AS author_name,
                u.avatar AS author_avatar,
                c.body,
                c.created_at,
                c.updated_at
             FROM comments c
             INNER JOIN users u ON u.id = c.author_user_id
             WHERE c.id = ?`,
      [commentId]
    )

    res.json(updatedRows[0])
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /api/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     operationId: deleteComment
 *     summary: Delete a comment (author only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Comment deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       403:
 *         description: Caller is not a team member, or is not the comment author
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/comments/:commentId', authenticate, async (req, res, next) => {
  try {
    const { commentId } = req.params

    const [existingRows] = await pool.query(
      `SELECT c.*, t.team_id
             FROM comments c
             INNER JOIN tasks t ON t.id = c.task_id
             WHERE c.id = ?`,
      [commentId]
    )

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    const existingComment = existingRows[0]

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, existingComment.team_id]
    )

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' })
    }

    if (existingComment.author_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the comment author can delete this comment' })
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [commentId])

    res.json({ message: 'Comment deleted successfully' })
  } catch (err) {
    next(err)
  }
})

export default router
