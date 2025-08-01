import React from 'react';
import { useParams } from 'react-router-dom';
import { Kanban } from 'lucide-react';

const ProjectDetail = () => {
  const { projectId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Project Detail</h1>
        <p className="text-slate-400">Project ID: {projectId}</p>
      </div>

      <div className="text-center py-12">
        <Kanban className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">
          Kanban board coming soon
        </h3>
        <p className="text-slate-500">
          This page will show the project's Kanban board with drag-and-drop functionality.
        </p>
      </div>
    </div>
  );
};

export default ProjectDetail;
