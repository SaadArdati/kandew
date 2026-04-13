import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/tasks/:taskId/comments', authenticate, async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const [taskRows] = await pool.query(
            'SELECT team_id FROM tasks WHERE id = ?',
            [taskId]
        );

        if (taskRows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const teamId = taskRows[0].team_id;

        const [membership] = await pool.query(
            'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
            [req.user.id, teamId]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this team' });
        }

        const [comments] = await pool.query(
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
             WHERE c.task_id = ?
             ORDER BY c.created_at ASC`,
            [taskId]
        );

        res.json(comments);
    } catch (err) {
        next(err);
    }
});

router.post('/tasks/:taskId/comments', authenticate, async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { body } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({ error: 'Comment body is required' });
        }

        const [taskRows] = await pool.query(
            'SELECT team_id FROM tasks WHERE id = ?',
            [taskId]
        );

        if (taskRows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const teamId = taskRows[0].team_id;

        const [membership] = await pool.query(
            'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
            [req.user.id, teamId]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this team' });
        }

        const [result] = await pool.query(
            `INSERT INTO comments (task_id, author_user_id, body)
             VALUES (?, ?, ?)`,
            [taskId, req.user.id, body.trim()]
        );

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
        );

        res.status(201).json(createdRows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/comments/:commentId', authenticate, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { body } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({ error: 'Comment body is required' });
        }

        const [existingRows] = await pool.query(
            `SELECT c.*, t.team_id
             FROM comments c
             INNER JOIN tasks t ON t.id = c.task_id
             WHERE c.id = ?`,
            [commentId]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const existingComment = existingRows[0];

        const [membership] = await pool.query(
            'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
            [req.user.id, existingComment.team_id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this team' });
        }

        if (existingComment.author_user_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the comment author can edit this comment' });
        }

        await pool.query(
            `UPDATE comments
             SET body = ?, updated_at = NOW()
             WHERE id = ?`,
            [body.trim(), commentId]
        );

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
        );

        res.json(updatedRows[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/comments/:commentId', authenticate, async (req, res, next) => {
    try {
        const { commentId } = req.params;

        const [existingRows] = await pool.query(
            `SELECT c.*, t.team_id
             FROM comments c
             INNER JOIN tasks t ON t.id = c.task_id
             WHERE c.id = ?`,
            [commentId]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const existingComment = existingRows[0];

        const [membership] = await pool.query(
            'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
            [req.user.id, existingComment.team_id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this team' });
        }

        if (existingComment.author_user_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the comment author can delete this comment' });
        }

        await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;