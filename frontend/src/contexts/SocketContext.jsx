import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketManager } from '../config/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext({});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, firebaseUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && firebaseUser) {
      const socket = socketManager.connect();
      
      // Set up event listeners
      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('authenticated', (data) => {
        console.log('Socket authenticated for user:', data.user.display_name);
      });

      socket.on('auth_error', (error) => {
        console.error('Socket authentication error:', error);
        toast.error('Real-time connection failed');
      });

      // User presence events
      socket.on('user_online', (user) => {
        setActiveUsers(prev => {
          const existing = prev.find(u => u.userId === user.userId);
          if (existing) return prev;
          return [...prev, user];
        });
      });

      socket.on('user_offline', (user) => {
        setActiveUsers(prev => prev.filter(u => u.userId !== user.userId));
      });

      // Notification events
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast notification
        switch (notification.type) {
          case 'task_assigned':
            toast.success(`New task assigned: ${notification.title}`);
            break;
          case 'task_updated':
            toast.info(`Task updated: ${notification.title}`);
            break;
          case 'project_invite':
            toast.success(`Project invitation: ${notification.title}`);
            break;
          case 'call_initiated':
            toast.info(`Video call started: ${notification.title}`);
            break;
          default:
            toast.info(notification.title);
        }
      });

      return () => {
        socketManager.disconnect();
        setIsConnected(false);
        setActiveUsers([]);
      };
    } else {
      // Disconnect when user is not authenticated
      socketManager.disconnect();
      setIsConnected(false);
      setActiveUsers([]);
    }
  }, [isAuthenticated, firebaseUser]);

  // Join project room
  const joinProject = (projectId) => {
    socketManager.joinProject(projectId);
  };

  // Leave project room
  const leaveProject = (projectId) => {
    socketManager.leaveProject(projectId);
  };

  // Task-related socket events
  const emitTaskUpdate = (task, projectId) => {
    socketManager.emitTaskUpdate(task, projectId);
  };

  const emitTaskCreate = (task, projectId) => {
    socketManager.emitTaskCreate(task, projectId);
  };

  const emitTaskDelete = (taskId, projectId) => {
    socketManager.emitTaskDelete(taskId, projectId);
  };

  // Typing indicators
  const emitTypingStart = (projectId, context) => {
    socketManager.emitTypingStart(projectId, context);
  };

  const emitTypingStop = (projectId, context) => {
    socketManager.emitTypingStop(projectId, context);
  };

  // Video call events
  const emitCallInitiated = (projectId, callId, callType) => {
    socketManager.emitCallInitiated(projectId, callId, callType);
  };

  const emitCallJoined = (projectId, callId) => {
    socketManager.emitCallJoined(projectId, callId);
  };

  const emitCallEnded = (projectId, callId) => {
    socketManager.emitCallEnded(projectId, callId);
  };

  // Listen to socket events
  const on = (event, callback) => {
    socketManager.on(event, callback);
  };

  const off = (event, callback) => {
    socketManager.off(event, callback);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get unread notification count
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const value = {
    // Connection state
    isConnected,
    activeUsers,
    notifications,
    
    // Project management
    joinProject,
    leaveProject,
    
    // Task events
    emitTaskUpdate,
    emitTaskCreate,
    emitTaskDelete,
    
    // Typing indicators
    emitTypingStart,
    emitTypingStop,
    
    // Video call events
    emitCallInitiated,
    emitCallJoined,
    emitCallEnded,
    
    // Event listeners
    on,
    off,
    
    // Notification management
    markNotificationAsRead,
    clearNotifications,
    getUnreadCount,
    
    // Socket manager instance
    socket: socketManager.socket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
