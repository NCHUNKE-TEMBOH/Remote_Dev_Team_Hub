import { io } from 'socket.io-client';
import { auth } from './firebase';

// Socket.IO configuration
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  connect() {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
    this.socket.connect();

    return this.socket;
  }

  // Setup default event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data.user.display_name);
    });

    this.socket.on('auth_error', (error) => {
      console.error('❌ Socket authentication error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Ping/pong for connection health
    this.socket.on('pong', () => {
      // Connection is healthy
    });

    // Set up ping interval
    setInterval(() => {
      if (this.isConnected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  // Authenticate with Firebase token
  async authenticate() {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        this.socket.emit('authenticate', { token });
      }
    } catch (error) {
      console.error('❌ Socket authentication failed:', error);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join project room
  joinProject(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_project', { projectId });
    }
  }

  // Leave project room
  leaveProject(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_project', { projectId });
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Listen to events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  // Task-related events
  emitTaskUpdate(task, projectId) {
    this.emit('task_updated', { task, projectId });
  }

  emitTaskCreate(task, projectId) {
    this.emit('task_created', { task, projectId });
  }

  emitTaskDelete(taskId, projectId) {
    this.emit('task_deleted', { taskId, projectId });
  }

  // Typing indicators
  emitTypingStart(projectId, context) {
    this.emit('typing_start', { projectId, context });
  }

  emitTypingStop(projectId, context) {
    this.emit('typing_stop', { projectId, context });
  }

  // Video call events
  emitCallInitiated(projectId, callId, callType) {
    this.emit('call_initiated', { projectId, callId, callType });
  }

  emitCallJoined(projectId, callId) {
    this.emit('call_joined', { projectId, callId });
  }

  emitCallEnded(projectId, callId) {
    this.emit('call_ended', { projectId, callId });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create and export socket manager instance
export const socketManager = new SocketManager();

// Convenience hooks for React components
export const useSocket = () => {
  return socketManager;
};

export default socketManager;
