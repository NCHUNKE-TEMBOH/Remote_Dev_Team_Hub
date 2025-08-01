import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';

const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <button className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      <div className="text-center py-12">
        <FolderOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">
          Projects page coming soon
        </h3>
        <p className="text-slate-500">
          This page will show all your projects with advanced filtering and management features.
        </p>
      </div>
    </div>
  );
};

export default Projects;
