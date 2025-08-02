import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FolderOpen,
  Search,
  Filter,
  Grid,
  List,
  Users,
  Calendar,
  MoreVertical,
  Edit3,
  Trash2,
  Settings
} from 'lucide-react';
import { projectsAPI } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { TeamLeadOnly } from '../components/auth/RoleGuard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectList from '../components/projects/ProjectList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');

  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await projectsAPI.create(projectData);
      setProjects(prev => [response.project, ...prev]);
      setShowCreateModal(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || project.user_role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'updated_at':
          return new Date(b.updated_at) - new Date(a.updated_at);
        case 'task_count':
          return (b.task_count || 0) - (a.task_count || 0);
        case 'member_count':
          return (b.member_count || 0) - (a.member_count || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">
            Manage your projects and collaborate with your team
          </p>
        </div>

        <TeamLeadOnly>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </TeamLeadOnly>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          >
            <option value="updated_at">Last Updated</option>
            <option value="created_at">Date Created</option>
            <option value="name">Name</option>
            <option value="task_count">Task Count</option>
            <option value="member_count">Member Count</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-midnight-800 border border-slate-600 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors duration-200 ${viewMode === 'grid'
                ? 'bg-neon-600 text-white'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors duration-200 ${viewMode === 'list'
                ? 'bg-neon-600 text-white'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          {projects.length === 0 ? (
            <>
              <FolderOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first project to start collaborating with your team.
              </p>
              <TeamLeadOnly>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </button>
              </TeamLeadOnly>
            </>
          ) : (
            <>
              <Search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                No projects found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search or filter criteria.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-slate-400">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>

          {/* Projects Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <ProjectList
              projects={filteredProjects}
              onDelete={handleDeleteProject}
            />
          )}
        </>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
};

export default Projects;
