import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  Users, 
  Settings, 
  LogOut,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Profile', href: '/profile', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-midnight-900 border-r border-slate-700">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-slate-700">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-neon-500" />
              <span className="ml-2 text-xl font-bold text-white">
                DevHub
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-neon-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info and status */}
          <div className="p-4 border-t border-slate-700">
            {/* Connection status */}
            <div className="flex items-center mb-4">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-neon-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-slate-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* User profile */}
            <div className="flex items-center mb-4">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name || 'User')}&background=22c55e&color=fff`}
                alt={user?.display_name}
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.display_name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-midnight-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-neon-500" />
              <span className="ml-2 text-xl font-bold text-white">
                DevHub
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-neon-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info and status */}
          <div className="p-4 border-t border-slate-700">
            {/* Connection status */}
            <div className="flex items-center mb-4">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-neon-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-slate-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* User profile */}
            <div className="flex items-center mb-4">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name || 'User')}&background=22c55e&color=fff`}
                alt={user?.display_name}
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.display_name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
