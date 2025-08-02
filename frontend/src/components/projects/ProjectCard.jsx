import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Settings,
  CheckSquare,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/useAuth';

const ProjectCard = ({ project, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const { canManageProjectSettings } = usePermissions();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-600 text-purple-100';
      case 'admin':
        return 'bg-blue-600 text-blue-100';
      case 'member':
        return 'bg-slate-600 text-slate-100';
      default:
        return 'bg-slate-600 text-slate-100';
    }
  };

  const formatRole = (role) => {
    return role?.charAt(0).toUpperCase() + role?.slice(1) || 'Member';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const canManage = canManageProjectSettings(project);

  return (
    <div className="card-hover p-6 group relative">
      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/projects/${project.id}`}
              className="block group-hover:text-neon-400 transition-colors duration-200"
            >
              <h3 className="font-semibold text-white text-lg truncate">
                {project.name}
              </h3>
            </Link>
            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium mt-1 ${getRoleBadgeColor(project.user_role)}`}>
              {formatRole(project.user_role)}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        {canManage && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-midnight-800 border border-slate-700 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200">
                      <Edit3 className="h-4 w-4 mr-3" />
                      Edit Project
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors duration-200">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    <div className="border-t border-slate-700 my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(project.id);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      Delete Project
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Project Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm">
          <CheckSquare className="h-4 w-4 text-slate-500 mr-2" />
          <span className="text-slate-400">
            {project.task_count || 0} tasks
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 text-slate-500 mr-2" />
          <span className="text-slate-400">
            {project.member_count || 0} members
          </span>
        </div>
      </div>

      {/* Project Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center text-xs text-slate-500">
          <Clock className="h-3 w-3 mr-1" />
          Updated {formatDate(project.updated_at)}
        </div>
        
        <Link
          to={`/projects/${project.id}`}
          className="flex items-center text-sm text-neon-400 hover:text-neon-300 transition-colors duration-200"
        >
          Open
          <ExternalLink className="h-3 w-3 ml-1" />
        </Link>
      </div>

      {/* Progress Indicator (if tasks exist) */}
      {project.task_count > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>
              {Math.round(((project.completed_tasks || 0) / project.task_count) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-neon-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(((project.completed_tasks || 0) / project.task_count) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neon-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none" />
    </div>
  );
};

export default ProjectCard;
