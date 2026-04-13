import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);
const VALID_COLUMNS = new Set(['todo', 'in-progress', 'review', 'done']);

router.get('/:id/tasks', authenticate, async (req, res, next) => {
  try {
    const teamId = req.params.id;

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, teamId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }

    const [tasks] = await pool.query(
      `SELECT
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
                t.sort_order
             FROM tasks t
             LEFT JOIN users u ON u.id = t.assignee_user_id
             WHERE t.team_id = ?
             ORDER BY
                FIELD(t.column_id, 'todo', 'in-progress', 'review', 'done'),
                t.sort_order ASC,
                t.created_at ASC`,
      [teamId]
    );

    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/tasks', authenticate, async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const {
      title,
      description,
      priority = 'medium',
      columnId = 'todo',
      assigneeUserId = null,
      maxPetals = 5,
      dueDate = null,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    if (!VALID_PRIORITIES.has(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    if (!VALID_COLUMNS.has(columnId)) {
      return res.status(400).json({ error: 'Invalid column' });
    }

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, teamId]
    );

    if (membership.length === 0 || membership[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the team owner can create tasks' });
    }

    if (assigneeUserId) {
      const [assigneeMembership] = await pool.query(
        'SELECT id FROM memberships WHERE user_id = ? AND team_id = ?',
        [assigneeUserId, teamId]
      );

      if (assigneeMembership.length === 0) {
        return res.status(400).json({ error: 'Assignee must belong to this team' });
      }
    }

    const [maxOrderRows] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM tasks WHERE team_id = ? AND column_id = ?',
      [teamId, columnId]
    );

    const sortOrder = Number(maxOrderRows[0].maxOrder) + 1;

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
    );

    const [createdRows] = await pool.query(
      `SELECT
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
                t.sort_order
             FROM tasks t
             LEFT JOIN users u ON u.id = t.assignee_user_id
             WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json(createdRows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/task/:taskId', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const [rows] = await pool.query(
      `SELECT
                t.*,
                u.username AS assignee_name,
                u.avatar AS assignee_avatar
             FROM tasks t
             LEFT JOIN users u ON u.id = t.assignee_user_id
             WHERE t.id = ?`,
      [taskId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/task/:taskId', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params;
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
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const existingTask = existingRows[0];

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, existingTask.team_id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }

    const moveOnlyFields = [
      'columnId',
      'sortOrder',
      'reviewEnteredAt',
      'frozenPetalsAtReview',
      'completedAt',
      'earnedPetals',
    ];

    const editOnlyFields = [
      'title',
      'description',
      'priority',
      'assigneeUserId',
      'maxPetals',
      'dueDate',
    ];

    const hasMoveField = moveOnlyFields.some((field) => field in req.body);
    const hasEditField = editOnlyFields.some((field) => field in req.body);

    if (hasEditField && membership[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the team owner can edit task details' });
    }

    if (!hasMoveField && !hasEditField) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const nextTitle = title?.trim() ?? existingTask.title;
    const nextDescription = description?.trim() ?? existingTask.description;
    const nextPriority = priority ?? existingTask.priority;
    const nextColumnId = columnId ?? existingTask.column_id;
    const nextAssigneeUserId =
      assigneeUserId === undefined ? existingTask.assignee_user_id : assigneeUserId;
    const nextMaxPetals = maxPetals ?? existingTask.max_petals;
    const nextDueDate = dueDate === undefined ? existingTask.due_date : dueDate;
    const nextEarnedPetals =
      earnedPetals === undefined ? existingTask.earned_petals : earnedPetals;
    const nextReviewEnteredAt =
      reviewEnteredAt === undefined ? existingTask.review_entered_at : reviewEnteredAt;
    const nextFrozenPetalsAtReview =
      frozenPetalsAtReview === undefined
        ? existingTask.frozen_petals_at_review
        : frozenPetalsAtReview;
    const nextCompletedAt =
      completedAt === undefined ? existingTask.completed_at : completedAt;
    const nextSortOrder = sortOrder ?? existingTask.sort_order;

    if (!nextTitle) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!nextDescription) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    if (!VALID_PRIORITIES.has(nextPriority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    if (!VALID_COLUMNS.has(nextColumnId)) {
      return res.status(400).json({ error: 'Invalid column' });
    }

    if (nextAssigneeUserId) {
      const [assigneeMembership] = await pool.query(
        'SELECT id FROM memberships WHERE user_id = ? AND team_id = ?',
        [nextAssigneeUserId, existingTask.team_id]
      );

      if (assigneeMembership.length === 0) {
        return res.status(400).json({ error: 'Assignee must belong to this team' });
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
    );

    const [updatedRows] = await pool.query(
      `SELECT
                t.*,
                u.username AS assignee_name,
                u.avatar AS assignee_avatar
             FROM tasks t
             LEFT JOIN users u ON u.id = t.assignee_user_id
             WHERE t.id = ?`,
      [taskId]
    );

    res.json(updatedRows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/task/:taskId', authenticate, async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const [existingRows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const existingTask = existingRows[0];

    const [membership] = await pool.query(
      'SELECT role FROM memberships WHERE user_id = ? AND team_id = ?',
      [req.user.id, existingTask.team_id]
    );

    if (membership.length === 0 || membership[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only the team owner can delete tasks' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;