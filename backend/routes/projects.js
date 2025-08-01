import express from 'express';
import { query } from '../config/database.js';
import { authenticateUser, requireProjectMember, requireProjectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all projects for the authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const projectsResult = await query(
      `SELECT p.*, pm.role as user_role, pm.joined_at,
       COUNT(DISTINCT t.id) as task_count,
       COUNT(DISTINCT pm2.user_id) as member_count,
       u.display_name as created_by_name
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN tasks t ON p.id = t.project_id
       LEFT JOIN project_members pm2 ON p.id = pm2.project_id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE pm.user_id = $1
       GROUP BY p.id, pm.role, pm.joined_at, u.display_name
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    res.status(200).json({
      projects: projectsResult.rows
    });

  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({ 
      message: 'Error fetching projects' 
    });
  }
});

// Create a new project
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const created_by = req.user.id;

    if (!name) {
      return res.status(400).json({ 
        message: 'Project name is required' 
      });
    }

    // Create project
    const projectResult = await query(
      `INSERT INTO projects (name, description, color, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, color || '#1f2937', created_by]
    );

    const project = projectResult.rows[0];

    // Add creator as project owner
    await query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, created_by]
    );

    res.status(201).json({
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ 
      message: 'Error creating project' 
    });
  }
});

// Get project by ID
router.get('/:projectId', authenticateUser, requireProjectMember, async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectResult = await query(
      `SELECT p.*, 
       COUNT(DISTINCT t.id) as task_count,
       COUNT(DISTINCT pm.user_id) as member_count,
       u.display_name as created_by_name
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1
       GROUP BY p.id, u.display_name`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Project not found' 
      });
    }

    res.status(200).json({
      project: projectResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({ 
      message: 'Error fetching project' 
    });
  }
});

// Update project
router.put('/:projectId', authenticateUser, requireProjectAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, color } = req.body;

    const updateResult = await query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, color, projectId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Project not found' 
      });
    }

    res.status(200).json({
      message: 'Project updated successfully',
      project: updateResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({ 
      message: 'Error updating project' 
    });
  }
});

// Delete project
router.delete('/:projectId', authenticateUser, requireProjectAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;

    const deleteResult = await query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [projectId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Project not found' 
      });
    }

    res.status(200).json({
      message: 'Project deleted successfully',
      project: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({ 
      message: 'Error deleting project' 
    });
  }
});

// Get project members
router.get('/:projectId/members', authenticateUser, requireProjectMember, async (req, res) => {
  try {
    const { projectId } = req.params;

    const membersResult = await query(
      `SELECT pm.*, u.display_name, u.email, u.photo_url, u.role as user_role
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.role DESC, u.display_name ASC`,
      [projectId]
    );

    res.status(200).json({
      members: membersResult.rows
    });

  } catch (error) {
    console.error('❌ Error fetching project members:', error);
    res.status(500).json({ 
      message: 'Error fetching project members' 
    });
  }
});

// Add member to project
router.post('/:projectId/members', authenticateUser, requireProjectAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    const validRoles = ['member', 'admin', 'owner'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role' 
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, display_name, email FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Add member
    const memberResult = await query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET role = $3, joined_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [projectId, user_id, role || 'member']
    );

    // Get complete member info
    const completeMemberResult = await query(
      `SELECT pm.*, u.display_name, u.email, u.photo_url, u.role as user_role
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1 AND pm.user_id = $2`,
      [projectId, user_id]
    );

    res.status(201).json({
      message: 'Member added successfully',
      member: completeMemberResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error adding project member:', error);
    res.status(500).json({ 
      message: 'Error adding project member' 
    });
  }
});

// Update member role
router.put('/:projectId/members/:userId', authenticateUser, requireProjectAdmin, async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const validRoles = ['member', 'admin', 'owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role' 
      });
    }

    const updateResult = await query(
      `UPDATE project_members 
       SET role = $1 
       WHERE project_id = $2 AND user_id = $3
       RETURNING *`,
      [role, projectId, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Member not found' 
      });
    }

    res.status(200).json({
      message: 'Member role updated successfully',
      member: updateResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating member role:', error);
    res.status(500).json({ 
      message: 'Error updating member role' 
    });
  }
});

// Remove member from project
router.delete('/:projectId/members/:userId', authenticateUser, requireProjectAdmin, async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Prevent removing the last owner
    const ownerCount = await query(
      'SELECT COUNT(*) as count FROM project_members WHERE project_id = $1 AND role = \'owner\'',
      [projectId]
    );

    const memberToRemove = await query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberToRemove.rows.length > 0 && 
        memberToRemove.rows[0].role === 'owner' && 
        parseInt(ownerCount.rows[0].count) <= 1) {
      return res.status(400).json({ 
        message: 'Cannot remove the last owner from the project' 
      });
    }

    const deleteResult = await query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *',
      [projectId, userId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Member not found' 
      });
    }

    res.status(200).json({
      message: 'Member removed successfully',
      member: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error removing project member:', error);
    res.status(500).json({ 
      message: 'Error removing project member' 
    });
  }
});

export default router;
