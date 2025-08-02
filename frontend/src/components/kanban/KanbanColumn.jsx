import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ column, tasks, onTaskClick }) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex flex-col w-80 bg-midnight-900 rounded-lg border border-slate-700">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${column.color}`} />
            <h3 className="font-semibold text-white">{column.title}</h3>
            <span className="ml-2 px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 min-h-[200px] transition-colors duration-200 ${
          isOver ? 'bg-neon-500/10 border-neon-500' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
            
            {/* Empty state */}
            {tasks.length === 0 && (
              <div className="text-center py-8">
                <div className="text-slate-500 text-sm">
                  {isOver ? (
                    <div className="p-4 border-2 border-dashed border-neon-500 rounded-lg bg-neon-500/5">
                      <span className="text-neon-400">Drop task here</span>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      No tasks in {column.title.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
