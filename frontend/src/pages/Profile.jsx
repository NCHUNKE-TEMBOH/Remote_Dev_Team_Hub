import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Shield,
  Activity,
  Calendar,
  BarChart3,
  Edit3,
  Mail,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../config/api';
import UserProfile from '../components/auth/UserProfile';
import { AdminOnly, TeamLeadOnly } from '../components/auth/RoleGuard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [user?.id]);

  const loadUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [projectsResponse, tasksResponse] = await Promise.all([
        usersAPI.getProjects(user.id),
        usersAPI.getTasks(user.id)
      ]);

      setUserStats({
        projects: projectsResponse.projects || [],
        tasks: tasksResponse.tasks || []
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-red-100';
      case 'project_manager':
        return 'bg-purple-600 text-purple-100';
      case 'team_lead':
        return 'bg-blue-600 text-blue-100';
      case 'team_member':
        return 'bg-slate-600 text-slate-100';
      default:
        return 'bg-slate-600 text-slate-100';
    }
  };

  const formatRole = (role) => {
    return role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Team Member';
  };

  const getTaskStatusCounts = () => {
    if (!userStats?.tasks) return { todo: 0, inProgress: 0, done: 0 };

    return userStats.tasks.reduce((acc, task) => {
      switch (task.status) {
        case 'todo':
          acc.todo++;
          break;
        case 'in-progress':
          acc.inProgress++;
          break;
        case 'done':
          acc.done++;
          break;
      }
      return acc;
    }, { todo: 0, inProgress: 0, done: 0 });
  };

  const taskCounts = getTaskStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button
          onClick={() => setShowProfileModal(true)}
          className="btn-primary flex items-center"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Profile
        </button>
      </div>

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="h-20 w-20 rounded-full border-4 border-slate-700"
              src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name || 'User')}&background=22c55e&color=fff&size=128`}
              alt={user?.display_name}
            />
            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-white">{user?.display_name}</h2>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-slate-400">
                  <Mail className="h-4 w-4 mr-1" />
                  {user?.email}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
                  {formatRole(user?.role)}
                </span>
              </div>
              <div className="flex items-center mt-2 text-sm text-slate-500">
                <Clock className="h-4 w-4 mr-1" />
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading statistics..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Projects */}
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Projects</p>
                <p className="text-2xl font-bold text-white">{userStats?.projects?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Tasks */}
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-neon-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{userStats?.tasks?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-white">{taskCounts.inProgress}</p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-white">{taskCounts.done}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Recent Projects
          </h3>
          {userStats?.projects?.length > 0 ? (
            <div className="space-y-3">
              {userStats.projects.slice(0, 5).map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-midnight-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">{project.name}</h4>
                    <p className="text-sm text-slate-400">{project.user_role}</p>
                  </div>
                  <div className="text-xs text-slate-500">
                    {project.task_count} tasks
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No projects yet</p>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Tasks
          </h3>
          {userStats?.tasks?.length > 0 ? (
            <div className="space-y-3">
              {userStats.tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-midnight-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">{task.title}</h4>
                    <p className="text-sm text-slate-400">{task.project_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${task.status === 'done' ? 'bg-green-600 text-green-100' :
                      task.status === 'in-progress' ? 'bg-blue-600 text-blue-100' :
                        'bg-slate-600 text-slate-100'
                    }`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No tasks assigned</p>
          )}
        </div>
      </div>

      {/* Admin Section */}
      <AdminOnly showFallback={false}>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn-secondary flex items-center justify-center">
              <User className="h-4 w-4 mr-2" />
              Manage Users
            </button>
            <button className="btn-secondary flex items-center justify-center">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </button>
            <button className="btn-secondary flex items-center justify-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </AdminOnly>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfile onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default Profile;
