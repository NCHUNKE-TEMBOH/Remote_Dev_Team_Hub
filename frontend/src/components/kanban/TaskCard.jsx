import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip,
  AlertCircle,
  Clock
} from 'lucide-react';

const TaskCard = ({ task, onClick, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low':
        return 'border-l-slate-500 bg-slate-500/5';
      default:
        return 'border-l-slate-600 bg-slate-600/5';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-400" />;
      case 'low':
        return <Clock className="h-3 w-3 text-slate-400" />;
      default:
        return null;
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-yellow-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-slate-400' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-slate-400' };
    }
  };

  const dueInfo = formatDueDate(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group cursor-pointer bg-midnight-800 border border-slate-700 rounded-lg p-4 
        hover:border-slate-600 hover:shadow-lg transition-all duration-200
        border-l-4 ${getPriorityColor(task.priority)}
        ${isDragging || isSortableDragging ? 'opacity-50 rotate-2 scale-105 shadow-xl' : ''}
      `}
    >
      {/* Task Title */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-white text-sm leading-tight flex-1 pr-2">
          {task.title}
        </h4>
        <div className="flex items-center space-x-1">
          {getPriorityIcon(task.priority)}
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Meta Information */}
      <div className="space-y-2">
        {/* Due Date */}
        {dueInfo && (
          <div className="flex items-center text-xs">
            <Calendar className="h-3 w-3 mr-1 text-slate-500" />
            <span className={dueInfo.color}>{dueInfo.text}</span>
          </div>
        )}

        {/* Assignee */}
        {task.assigned_to_name && (
          <div className="flex items-center text-xs">
            <User className="h-3 w-3 mr-1 text-slate-500" />
            <span className="text-slate-400">{task.assigned_to_name}</span>
          </div>
        )}

        {/* Task Footer */}
        <div className="flex items-center justify-between pt-2">
          {/* Task ID */}
          <span className="text-xs text-slate-500 font-mono">
            #{task.id}
          </span>

          {/* Task Actions/Indicators */}
          <div className="flex items-center space-x-2">
            {/* Comments indicator (placeholder) */}
            <div className="flex items-center text-xs text-slate-500">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>0</span>
            </div>

            {/* Attachments indicator (placeholder) */}
            <div className="flex items-center text-xs text-slate-500">
              <Paperclip className="h-3 w-3 mr-1" />
              <span>0</span>
            </div>

            {/* Assignee Avatar */}
            {task.assigned_to_photo && (
              <img
                src={task.assigned_to_photo}
                alt={task.assigned_to_name}
                className="h-6 w-6 rounded-full border border-slate-600"
              />
            )}
          </div>
        </div>
      </div>

      {/* Drag Handle Indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex flex-col space-y-1">
          <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
          <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
          <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
