import React from 'react';
import { X, Check, Trash2, Bell } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearNotifications } = useSocket();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return '📋';
      case 'task_updated':
        return '✏️';
      case 'project_invite':
        return '👥';
      case 'call_initiated':
        return '📞';
      default:
        return '🔔';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-midnight-900 border-l border-slate-700 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-b border-slate-700">
              <button
                onClick={clearNotifications}
                className="flex items-center text-sm text-slate-400 hover:text-white transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </button>
            </div>
          )}

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Bell className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">
                  No notifications
                </h3>
                <p className="text-sm text-slate-500">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-3 rounded-lg border transition-colors duration-200 cursor-pointer
                      ${notification.read 
                        ? 'bg-midnight-800 border-slate-700' 
                        : 'bg-midnight-700 border-neon-500/30 hover:bg-midnight-600'
                      }
                    `}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <span className="text-lg mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-neon-500 rounded-full ml-2 flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
