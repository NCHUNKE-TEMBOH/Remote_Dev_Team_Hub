import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Filter, Search } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import CreateTaskModal from './CreateTaskModal';
import { tasksAPI } from '../../config/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-600' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-600' },
  { id: 'review', title: 'Review', color: 'bg-yellow-600' },
  { id: 'done', title: 'Done', color: 'bg-neon-600' }
];

const KanbanBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const { user } = useAuth();
  const { joinProject, leaveProject, on, off, emitTaskUpdate } = useSocket();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    joinProject(projectId);

    // Set up real-time listeners
    on('task_created', handleTaskCreated);
    on('task_updated', handleTaskUpdated);
    on('task_deleted', handleTaskDeleted);

    return () => {
      leaveProject(projectId);
      off('task_created', handleTaskCreated);
      off('task_updated', handleTaskUpdated);
      off('task_deleted', handleTaskDeleted);
    };
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getByProject(projectId);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Real-time event handlers
  const handleTaskCreated = (data) => {
    if (data.task.project_id === parseInt(projectId)) {
      setTasks(prev => [...prev, data.task]);
      toast.success(`New task created by ${data.createdBy.displayName}`);
    }
  };

  const handleTaskUpdated = (data) => {
    if (data.task.project_id === parseInt(projectId)) {
      setTasks(prev => prev.map(task => 
        task.id === data.task.id ? data.task : task
      ));
      if (data.updatedBy.id !== user.id) {
        toast.info(`Task updated by ${data.updatedBy.displayName}`);
      }
    }
  };

  const handleTaskDeleted = (data) => {
    setTasks(prev => prev.filter(task => task.id !== data.taskId));
    if (data.deletedBy.id !== user.id) {
      toast.info(`Task deleted by ${data.deletedBy.displayName}`);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = over.id;

    if (activeTask.status !== overColumn) {
      // Update task status
      try {
        const updatedTask = { ...activeTask, status: overColumn };
        
        // Optimistic update
        setTasks(prev => prev.map(task => 
          task.id === active.id ? updatedTask : task
        ));

        // Update on server
        await tasksAPI.update(active.id, { status: overColumn });
        
        // Emit real-time update
        emitTaskUpdate(updatedTask, projectId);
        
        toast.success('Task moved successfully');
      } catch (error) {
        console.error('Failed to update task:', error);
        toast.error('Failed to move task');
        // Revert optimistic update
        loadTasks();
      }
    }
  };

  // Task management functions
  const handleCreateTask = async (taskData) => {
    try {
      const response = await tasksAPI.create({
        ...taskData,
        project_id: projectId
      });
      
      setTasks(prev => [...prev, response.task]);
      setShowCreateModal(false);
      
      // Emit real-time update
      emitTaskUpdate(response.task, projectId);
      
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await tasksAPI.update(taskId, updates);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? response.task : task
      ));
      
      // Emit real-time update
      emitTaskUpdate(response.task, projectId);
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSelectedTask(null);
      
      // Emit real-time update
      emitTaskDelete(taskId, projectId);
      
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || 
                           (filterAssignee === 'me' && task.assigned_to === user.id) ||
                           task.assigned_to === parseInt(filterAssignee);
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Group tasks by status
  const tasksByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with filters and actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
            />
          </div>

          {/* Filters */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          >
            <option value="all">All Assignees</option>
            <option value="me">My Tasks</option>
            <option value="">Unassigned</option>
          </select>
        </div>

        {/* Create task button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-max pb-6">
            {COLUMNS.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id]}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
