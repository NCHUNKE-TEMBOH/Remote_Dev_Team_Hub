import { verifyIdToken } from '../config/firebase.js';
import { query } from '../config/database.js';

// Store active users and their socket connections
const activeUsers = new Map();
const userSockets = new Map();

export const handleSocketConnection = (socket, io) => {
  console.log('🔌 New socket connection:', socket.id);

  // Handle user authentication
  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      
      if (!token) {
        socket.emit('auth_error', { message: 'Token required' });
        return;
      }

      // Verify Firebase token
      const decodedToken = await verifyIdToken(token);
      
      // Get user from database
      const userResult = await query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [decodedToken.uid]
      );

      if (userResult.rows.length === 0) {
        socket.emit('auth_error', { message: 'User not found' });
        return;
      }

      const user = userResult.rows[0];
      
      // Store user info in socket
      socket.userId = user.id;
      socket.userInfo = user;
      
      // Track active user
      activeUsers.set(user.id, {
        ...user,
        socketId: socket.id,
        lastSeen: new Date()
      });
      
      userSockets.set(user.id, socket);

      // Join user to their personal room
      socket.join(`user_${user.id}`);

      // Get user's projects and join project rooms
      const projectsResult = await query(
        'SELECT project_id FROM project_members WHERE user_id = $1',
        [user.id]
      );

      for (const project of projectsResult.rows) {
        socket.join(`project_${project.project_id}`);
      }

      socket.emit('authenticated', { 
        user: { ...user, firebase_uid: undefined },
        message: 'Authentication successful' 
      });

      // Broadcast user online status to their projects
      for (const project of projectsResult.rows) {
        socket.to(`project_${project.project_id}`).emit('user_online', {
          userId: user.id,
          displayName: user.display_name,
          photoUrl: user.photo_url
        });
      }

      console.log('✅ User authenticated:', user.display_name);

    } catch (error) {
      console.error('❌ Socket authentication error:', error);
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  });

  // Handle joining project rooms
  socket.on('join_project', async (data) => {
    try {
      const { projectId } = data;
      
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      // Verify user is a member of the project
      const memberResult = await query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, socket.userId]
      );

      if (memberResult.rows.length === 0) {
        socket.emit('error', { message: 'Access denied to project' });
        return;
      }

      socket.join(`project_${projectId}`);
      socket.emit('joined_project', { projectId });

      // Notify other project members
      socket.to(`project_${projectId}`).emit('user_joined_project', {
        userId: socket.userId,
        displayName: socket.userInfo.display_name,
        projectId
      });

    } catch (error) {
      console.error('❌ Error joining project:', error);
      socket.emit('error', { message: 'Failed to join project' });
    }
  });

  // Handle leaving project rooms
  socket.on('leave_project', (data) => {
    const { projectId } = data;
    socket.leave(`project_${projectId}`);
    socket.emit('left_project', { projectId });

    // Notify other project members
    socket.to(`project_${projectId}`).emit('user_left_project', {
      userId: socket.userId,
      displayName: socket.userInfo?.display_name,
      projectId
    });
  });

  // Handle task updates
  socket.on('task_updated', (data) => {
    const { task, projectId } = data;
    
    if (!socket.userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    // Broadcast task update to project members
    socket.to(`project_${projectId}`).emit('task_updated', {
      task,
      updatedBy: {
        id: socket.userId,
        displayName: socket.userInfo.display_name
      }
    });
  });

  // Handle task creation
  socket.on('task_created', (data) => {
    const { task, projectId } = data;
    
    if (!socket.userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    // Broadcast new task to project members
    socket.to(`project_${projectId}`).emit('task_created', {
      task,
      createdBy: {
        id: socket.userId,
        displayName: socket.userInfo.display_name
      }
    });
  });

  // Handle task deletion
  socket.on('task_deleted', (data) => {
    const { taskId, projectId } = data;
    
    if (!socket.userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    // Broadcast task deletion to project members
    socket.to(`project_${projectId}`).emit('task_deleted', {
      taskId,
      deletedBy: {
        id: socket.userId,
        displayName: socket.userInfo.display_name
      }
    });
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { projectId, context } = data;
    
    if (!socket.userId) return;

    socket.to(`project_${projectId}`).emit('user_typing', {
      userId: socket.userId,
      displayName: socket.userInfo.display_name,
      context
    });
  });

  socket.on('typing_stop', (data) => {
    const { projectId, context } = data;
    
    if (!socket.userId) return;

    socket.to(`project_${projectId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      context
    });
  });

  // Handle video call events
  socket.on('call_initiated', (data) => {
    const { projectId, callId, callType } = data;
    
    if (!socket.userId) return;

    socket.to(`project_${projectId}`).emit('call_initiated', {
      callId,
      callType,
      initiatedBy: {
        id: socket.userId,
        displayName: socket.userInfo.display_name,
        photoUrl: socket.userInfo.photo_url
      }
    });
  });

  socket.on('call_joined', (data) => {
    const { projectId, callId } = data;
    
    if (!socket.userId) return;

    socket.to(`project_${projectId}`).emit('call_joined', {
      callId,
      joinedBy: {
        id: socket.userId,
        displayName: socket.userInfo.display_name
      }
    });
  });

  socket.on('call_ended', (data) => {
    const { projectId, callId } = data;
    
    if (!socket.userId) return;

    socket.to(`project_${projectId}`).emit('call_ended', {
      callId,
      endedBy: {
        id: socket.userId,
        displayName: socket.userInfo.display_name
      }
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
    
    if (socket.userId) {
      // Remove from active users
      activeUsers.delete(socket.userId);
      userSockets.delete(socket.userId);

      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        displayName: socket.userInfo?.display_name
      });

      console.log('👋 User disconnected:', socket.userInfo?.display_name);
    }
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
};

// Helper function to send notification to specific user
export const sendNotificationToUser = (userId, notification) => {
  const userSocket = userSockets.get(userId);
  if (userSocket) {
    userSocket.emit('notification', notification);
  }
};

// Helper function to broadcast to project members
export const broadcastToProject = (projectId, event, data) => {
  // This would be called from the main io instance
  // io.to(`project_${projectId}`).emit(event, data);
};

// Get active users
export const getActiveUsers = () => {
  return Array.from(activeUsers.values());
};

// Get active users for a project
export const getActiveProjectUsers = async (projectId) => {
  try {
    const projectMembersResult = await query(
      'SELECT user_id FROM project_members WHERE project_id = $1',
      [projectId]
    );

    const activeProjectUsers = projectMembersResult.rows
      .map(member => activeUsers.get(member.user_id))
      .filter(user => user !== undefined);

    return activeProjectUsers;
  } catch (error) {
    console.error('❌ Error getting active project users:', error);
    return [];
  }
};
