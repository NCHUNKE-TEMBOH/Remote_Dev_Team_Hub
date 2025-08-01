import React from 'react';
import { Menu, Bell, Search, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Header = ({ onMenuClick, onNotificationClick }) => {
  const { user } = useAuth();
  const { getUnreadCount } = useSocket();
  const unreadCount = getUnreadCount();

  return (
    <header className="bg-midnight-900 border-b border-slate-700 h-16 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center ml-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="pl-10 pr-4 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200 w-64"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Quick actions */}
        <button className="hidden md:flex items-center px-3 py-2 bg-neon-600 hover:bg-neon-700 text-white rounded-lg transition-colors duration-200">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div className="flex items-center">
          <img
            className="h-8 w-8 rounded-full"
            src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name || 'User')}&background=22c55e&color=fff`}
            alt={user?.display_name}
          />
          <span className="hidden md:block ml-3 text-sm font-medium text-white">
            {user?.display_name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
