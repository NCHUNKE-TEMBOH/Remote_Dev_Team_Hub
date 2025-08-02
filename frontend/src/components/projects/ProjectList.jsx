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
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/useAuth';

const ProjectList = ({ projects, onDelete }) => {
  const [activeMenu, setActiveMenu] = useState(null);
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = (project) => {
    if (!project.task_count || project.task_count === 0) return 0;
    return Math.round(((project.completed_tasks || 0) / project.task_count) * 100);
  };

  return (
    <div className="card overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-midnight-800">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-400">
          <div className="col-span-4">Project</div>
          <div className="col-span-2 text-center">Role</div>
          <div className="col-span-2 text-center">Tasks</div>
          <div className="col-span-2 text-center">Members</div>
          <div className="col-span-1 text-center">Progress</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-700">
        {projects.map((project) => {
          const canManage = canManageProjectSettings(project);
          const progressPercentage = getProgressPercentage(project);

          return (
            <div
              key={project.id}
              className="px-6 py-4 hover:bg-midnight-800 transition-colors duration-200 group"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Project Info */}
                <div className="col-span-4">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/projects/${project.id}`}
                        className="block group-hover:text-neon-400 transition-colors duration-200"
                      >
                        <h3 className="font-medium text-white truncate">
                          {project.name}
                        </h3>
                      </Link>
                      {project.description && (
                        <p className="text-sm text-slate-400 truncate mt-1">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Updated {formatDate(project.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(project.user_role)}`}>
                    {formatRole(project.user_role)}
                  </span>
                </div>

                {/* Tasks */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center">
                    <CheckSquare className="h-4 w-4 text-slate-500 mr-1" />
                    <span className="text-white font-medium">
                      {project.task_count || 0}
                    </span>
                  </div>
                </div>

                {/* Members */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 text-slate-500 mr-1" />
                    <span className="text-white font-medium">
                      {project.member_count || 0}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="col-span-1 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-white mb-1">
                      {progressPercentage}%
                    </span>
                    <div className="w-12 bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-neon-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="p-2 text-slate-400 hover:text-neon-400 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                      title="Open Project"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    {canManage && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
                          title="More Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenu === project.id && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenu(null)}
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
                                    setActiveMenu(null);
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;
