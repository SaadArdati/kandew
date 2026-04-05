import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
    try {
        const [teams] = await pool.query(
            `SELECT t.* FROM teams t
             INNER JOIN memberships m ON t.id = m.team_id
             WHERE m.user_id = ?`,
            [req.user.id]
        );
        res.json(teams);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [teams] = await pool.query(
            `SELECT t.* FROM teams t
             INNER JOIN memberships m ON t.id = m.team_id
             WHERE t.id = ? AND m.user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (teams.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json(teams[0]);
    } catch (err) {
        next(err);
    }
});

router.post('/', authenticate, async (req, res, next) => {
    try {
        const { name, icon } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Team name is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO teams (name, icon, creator_user_id) VALUES (?, ?, ?)',
            [name.trim(), icon || null, req.user.id]
        );

        await pool.query(
            'INSERT INTO memberships (user_id, team_id, role) VALUES (?, ?, ?)',
            [req.user.id, result.insertId, 'owner']
        );

        const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [result.insertId]);
        res.status(201).json(teams[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { name, icon, petal_value } = req.body;

        const [membership] = await pool.query(
            `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
            [req.user.id, req.params.id]
        );

        if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
            return res.status(403).json({ error: 'Not authorized to edit this team' });
        }

        const updates = [];
        const values = [];

        if (name) { updates.push('name = ?'); values.push(name.trim()); }
        if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }
        if (petal_value !== undefined) { updates.push('petal_value = ?'); values.push(petal_value); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.params.id);
        await pool.query(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`, values);

        const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
        res.json(teams[0]);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const [membership] = await pool.query(
            `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
            [req.user.id, req.params.id]
        );

        if (membership.length === 0 || membership[0].role !== 'owner') {
            return res.status(403).json({ error: 'Only the owner can delete this team' });
        }

        await pool.query('DELETE FROM teams WHERE id = ?', [req.params.id]);
        res.json({ message: 'Team deleted successfully' });
    } catch (err) {
        next(err);
    }
});

router.get('/:id/members', authenticate, async (req, res, next) => {
    try {
        const [membership] = await pool.query(
            `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
            [req.user.id, req.params.id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this team' });
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
        );

        const [team] = await pool.query('SELECT petal_value FROM teams WHERE id = ?', [req.params.id]);
        const petalValue = team[0]?.petal_value || 1;

        const membersWithEarnings = members.map(m => ({
            ...m,
            money_earned: (m.petals_earned * petalValue).toFixed(2)
        }));

        res.json(membersWithEarnings);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/members', authenticate, async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const [membership] = await pool.query(
            `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
            [req.user.id, req.params.id]
        );

        if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
            return res.status(403).json({ error: 'Not authorized to invite members' });
        }

        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = users[0].id;

        const [existing] = await pool.query(
            'SELECT id FROM memberships WHERE user_id = ? AND team_id = ?',
            [userId, req.params.id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'User is already a member' });
        }

        await pool.query(
            'INSERT INTO memberships (user_id, team_id, role) VALUES (?, ?, ?)',
            [userId, req.params.id, 'member']
        );

        res.status(201).json({ message: 'Member invited successfully' });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id/members/:memberId', authenticate, async (req, res, next) => {
    try {
        const [membership] = await pool.query(
            `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
            [req.user.id, req.params.id]
        );

        if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
            return res.status(403).json({ error: 'Not authorized to kick members' });
        }

        const [targetMembership] = await pool.query(
            `SELECT role FROM memberships WHERE user_id = ? AND team_id = ?`,
            [req.params.memberId, req.params.id]
        );

        if (targetMembership.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (targetMembership[0].role === 'owner') {
            return res.status(403).json({ error: 'Cannot kick the owner' });
        }

        await pool.query(
            'DELETE FROM memberships WHERE user_id = ? AND team_id = ?',
            [req.params.memberId, req.params.id]
        );

        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;