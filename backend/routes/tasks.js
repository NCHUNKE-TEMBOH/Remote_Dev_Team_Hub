import express from 'express';
import { query } from '../config/database.js';
import { authenticateUser, requireProjectMember } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', authenticateUser, requireProjectMember, async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasksResult = await query(
      `SELECT t.*, 
       u_assigned.display_name as assigned_to_name,
       u_assigned.photo_url as assigned_to_photo,
       u_created.display_name as created_by_name
       FROM tasks t
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_created ON t.created_by = u_created.id
       WHERE t.project_id = $1
       ORDER BY t.position ASC, t.created_at DESC`,
      [projectId]
    );

    res.status(200).json({
      tasks: tasksResult.rows
    });

  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks' 
    });
  }
});

// Create a new task
router.post('/', authenticateUser, requireProjectMember, async (req, res) => {
  try {
    const { title, description, status, priority, project_id, assigned_to, due_date } = req.body;
    const created_by = req.user.id;

    if (!title || !project_id) {
      return res.status(400).json({ 
        message: 'Title and project_id are required' 
      });
    }

    // Get the next position for the task
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM tasks WHERE project_id = $1',
      [project_id]
    );
    const position = positionResult.rows[0].next_position;

    const taskResult = await query(
      `INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, status || 'todo', priority || 'medium', project_id, assigned_to, created_by, due_date, position]
    );

    // Get the complete task with user information
    const completeTaskResult = await query(
      `SELECT t.*, 
       u_assigned.display_name as assigned_to_name,
       u_assigned.photo_url as assigned_to_photo,
       u_created.display_name as created_by_name
       FROM tasks t
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_created ON t.created_by = u_created.id
       WHERE t.id = $1`,
      [taskResult.rows[0].id]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: completeTaskResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(500).json({ 
      message: 'Error creating task' 
    });
  }
});

// Update a task
router.put('/:taskId', authenticateUser, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigned_to, due_date, position } = req.body;
    const userId = req.user.id;

    // First, verify the user has access to this task's project
    const taskProjectResult = await query(
      `SELECT t.project_id FROM tasks t WHERE t.id = $1`,
      [taskId]
    );

    if (taskProjectResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Task not found' 
      });
    }

    const projectId = taskProjectResult.rows[0].project_id;

    // Check if user is a member of the project
    const memberResult = await query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Update the task
    const updateResult = await query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assigned_to = $5,
           due_date = $6,
           position = COALESCE($7, position),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, status, priority, assigned_to, due_date, position, taskId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Task not found' 
      });
    }

    // Get the complete updated task with user information
    const completeTaskResult = await query(
      `SELECT t.*, 
       u_assigned.display_name as assigned_to_name,
       u_assigned.photo_url as assigned_to_photo,
       u_created.display_name as created_by_name
       FROM tasks t
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_created ON t.created_by = u_created.id
       WHERE t.id = $1`,
      [taskId]
    );

    res.status(200).json({
      message: 'Task updated successfully',
      task: completeTaskResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({ 
      message: 'Error updating task' 
    });
  }
});

// Delete a task
router.delete('/:taskId', authenticateUser, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // First, verify the user has access to this task's project
    const taskProjectResult = await query(
      `SELECT t.project_id, t.created_by FROM tasks t WHERE t.id = $1`,
      [taskId]
    );

    if (taskProjectResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Task not found' 
      });
    }

    const { project_id: projectId, created_by: createdBy } = taskProjectResult.rows[0];

    // Check if user is a member of the project or the task creator
    const memberResult = await query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberResult.rows.length === 0 && createdBy !== userId) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete tasks you created or if you are a project member.' 
      });
    }

    // Delete the task
    const deleteResult = await query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [taskId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Task not found' 
      });
    }

    res.status(200).json({
      message: 'Task deleted successfully',
      task: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error deleting task:', error);
    res.status(500).json({ 
      message: 'Error deleting task' 
    });
  }
});

// Update task positions (for drag and drop)
router.put('/reorder/project/:projectId', authenticateUser, requireProjectMember, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tasks } = req.body; // Array of {id, position, status}

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ 
        message: 'Tasks array is required' 
      });
    }

    // Update positions in a transaction
    const client = await query('BEGIN');
    
    try {
      for (const task of tasks) {
        await query(
          'UPDATE tasks SET position = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND project_id = $4',
          [task.position, task.status, task.id, projectId]
        );
      }
      
      await query('COMMIT');

      res.status(200).json({
        message: 'Task positions updated successfully'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error updating task positions:', error);
    res.status(500).json({ 
      message: 'Error updating task positions' 
    });
  }
});

export default router;
