import express from 'express';
import { query } from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get all users (for project member selection)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    
    let queryText = `
      SELECT id, display_name, email, photo_url, role, created_at
      FROM users
    `;
    let queryParams = [];

    if (search) {
      queryText += ` WHERE display_name ILIKE $1 OR email ILIKE $1`;
      queryParams.push(`%${search}%`);
    }

    queryText += ` ORDER BY display_name ASC LIMIT $${queryParams.length + 1}`;
    queryParams.push(parseInt(limit));

    const usersResult = await query(queryText, queryParams);

    res.status(200).json({
      users: usersResult.rows
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users' 
    });
  }
});

// Get user by ID
router.get('/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await query(
      `SELECT u.id, u.display_name, u.email, u.photo_url, u.role, u.created_at,
       COUNT(DISTINCT pm.project_id) as project_count,
       COUNT(DISTINCT t.id) as task_count
       FROM users u
       LEFT JOIN project_members pm ON u.id = pm.user_id
       LEFT JOIN tasks t ON u.id = t.assigned_to
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      user: userResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user' 
    });
  }
});

// Get user's projects
router.get('/:userId/projects', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Users can only see their own projects unless they're admin
    if (userId != requestingUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied' 
      });
    }

    const projectsResult = await query(
      `SELECT p.*, pm.role as user_role, pm.joined_at,
       COUNT(DISTINCT t.id) as task_count,
       COUNT(DISTINCT pm2.user_id) as member_count
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN tasks t ON p.id = t.project_id
       LEFT JOIN project_members pm2 ON p.id = pm2.project_id
       WHERE pm.user_id = $1
       GROUP BY p.id, pm.role, pm.joined_at
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    res.status(200).json({
      projects: projectsResult.rows
    });

  } catch (error) {
    console.error('❌ Error fetching user projects:', error);
    res.status(500).json({ 
      message: 'Error fetching user projects' 
    });
  }
});

// Get user's tasks
router.get('/:userId/tasks', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const { status, project_id } = req.query;

    // Users can only see their own tasks unless they're admin or project member
    if (userId != requestingUserId && req.user.role !== 'admin') {
      // Check if requesting user is a member of the same projects
      const sharedProjectsResult = await query(
        `SELECT DISTINCT pm1.project_id 
         FROM project_members pm1
         JOIN project_members pm2 ON pm1.project_id = pm2.project_id
         WHERE pm1.user_id = $1 AND pm2.user_id = $2`,
        [requestingUserId, userId]
      );

      if (sharedProjectsResult.rows.length === 0) {
        return res.status(403).json({ 
          message: 'Access denied' 
        });
      }
    }

    let queryText = `
      SELECT t.*, p.name as project_name, p.color as project_color,
       u_created.display_name as created_by_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_created ON t.created_by = u_created.id
      WHERE t.assigned_to = $1
    `;
    let queryParams = [userId];

    if (status) {
      queryText += ` AND t.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (project_id) {
      queryText += ` AND t.project_id = $${queryParams.length + 1}`;
      queryParams.push(project_id);
    }

    queryText += ` ORDER BY t.due_date ASC NULLS LAST, t.priority DESC, t.created_at DESC`;

    const tasksResult = await query(queryText, queryParams);

    res.status(200).json({
      tasks: tasksResult.rows
    });

  } catch (error) {
    console.error('❌ Error fetching user tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching user tasks' 
    });
  }
});

// Update user role (admin only)
router.put('/:userId/role', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Only admins can change user roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin privileges required' 
      });
    }

    const validRoles = ['team_member', 'team_lead', 'project_manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role' 
      });
    }

    const updateResult = await query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [role, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const { firebase_uid, ...userResponse } = updateResult.rows[0];

    res.status(200).json({
      message: 'User role updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({ 
      message: 'Error updating user role' 
    });
  }
});

export default router;
