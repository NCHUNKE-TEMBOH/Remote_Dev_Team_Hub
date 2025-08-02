import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Save, 
  Trash2, 
  Calendar, 
  User, 
  Flag,
  Clock,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../config/api';

const TaskModal = ({ task, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(task.id, {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        assigned_to: editedTask.assigned_to,
        due_date: editedTask.due_date
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
    }
  };

  const canEdit = user.id === task.created_by || user.id === task.assigned_to || 
                 ['admin', 'project_manager', 'team_lead'].includes(user.role);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-slate-400 bg-slate-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'text-neon-400 bg-neon-400/10';
      case 'in-progress': return 'text-blue-400 bg-blue-400/10';
      case 'review': return 'text-yellow-400 bg-yellow-400/10';
      case 'todo': return 'text-slate-400 bg-slate-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-900 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-500 font-mono">#{task.id}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && (
              <>
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="p-2 text-neon-400 hover:text-neon-300 hover:bg-neon-400/10 rounded-lg transition-colors duration-200"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
              />
            ) : (
              <h2 className="text-xl font-semibold text-white">{task.title}</h2>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-slate-300">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Assignee
              </label>
              {isEditing ? (
                <select
                  value={editedTask.assigned_to || ''}
                  onChange={(e) => setEditedTask(prev => ({ 
                    ...prev, 
                    assigned_to: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center">
                  {task.assigned_to_photo && (
                    <img
                      src={task.assigned_to_photo}
                      alt={task.assigned_to_name}
                      className="h-8 w-8 rounded-full mr-3"
                    />
                  )}
                  <span className="text-white">
                    {task.assigned_to_name || 'Unassigned'}
                  </span>
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Flag className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              {isEditing ? (
                <select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editedTask.due_date ? new Date(editedTask.due_date).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditedTask(prev => ({ 
                    ...prev, 
                    due_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                  }))}
                  className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                />
              ) : (
                <span className="text-white">
                  {task.due_date 
                    ? new Date(task.due_date).toLocaleDateString() 
                    : 'No due date'
                  }
                </span>
              )}
            </div>

            {/* Created By */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Created By
              </label>
              <span className="text-white">
                {task.created_by_name}
              </span>
              <div className="text-xs text-slate-400 mt-1">
                {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Comments Section (Placeholder) */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 text-slate-400 mr-2" />
              <h3 className="text-lg font-medium text-white">Comments</h3>
            </div>
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Comments feature coming soon</p>
            </div>
          </div>

          {/* Attachments Section (Placeholder) */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center mb-4">
              <Paperclip className="h-5 w-5 text-slate-400 mr-2" />
              <h3 className="text-lg font-medium text-white">Attachments</h3>
            </div>
            <div className="text-center py-8 text-slate-500">
              <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>File attachments feature coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
