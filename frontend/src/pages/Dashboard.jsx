import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - will be replaced with real API calls
  const stats = {
    projects: 3,
    tasks: 12,
    teamMembers: 8,
    pendingTasks: 5
  };

  const recentProjects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Building a modern e-commerce solution',
      color: '#3b82f6',
      taskCount: 8,
      memberCount: 4,
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      description: 'Redesigning the mobile application UI/UX',
      color: '#8b5cf6',
      taskCount: 6,
      memberCount: 3,
      lastActivity: '1 day ago'
    },
    {
      id: 3,
      name: 'API Documentation',
      description: 'Creating comprehensive API documentation',
      color: '#10b981',
      taskCount: 4,
      memberCount: 2,
      lastActivity: '3 days ago'
    }
  ];

  const recentTasks = [
    {
      id: 1,
      title: 'Implement user authentication',
      project: 'E-commerce Platform',
      priority: 'high',
      dueDate: 'Today',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Design product listing page',
      project: 'Mobile App Redesign',
      priority: 'medium',
      dueDate: 'Tomorrow',
      status: 'todo'
    },
    {
      id: 3,
      title: 'Write API endpoint documentation',
      project: 'API Documentation',
      priority: 'low',
      dueDate: 'Next week',
      status: 'todo'
    }
  ];

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
      case 'todo': return 'text-slate-400 bg-slate-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-neon-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.display_name}! 👋
        </h1>
        <p className="text-neon-100">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Projects</p>
              <p className="text-2xl font-bold text-white">{stats.projects}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-neon-600 rounded-lg">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{stats.tasks}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Team Members</p>
              <p className="text-2xl font-bold text-white">{stats.teamMembers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-sm text-neon-400 hover:text-neon-300 flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-midnight-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: project.color }}
                      />
                      <h3 className="font-medium text-white">{project.name}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center text-xs text-slate-500 space-x-4">
                      <span>{project.taskCount} tasks</span>
                      <span>{project.memberCount} members</span>
                      <span>{project.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/projects"
            className="mt-4 flex items-center justify-center w-full py-2 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Link>
        </div>

        {/* Recent Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Your Tasks</h2>
            <Link
              to="/tasks"
              className="text-sm text-neon-400 hover:text-neon-300 flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-midnight-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{task.project}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">Due {task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
