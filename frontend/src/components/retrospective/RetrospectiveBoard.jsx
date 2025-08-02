import React, { useState, useEffect } from 'react';
import {
  Plus,
  Smile,
  Frown,
  Lightbulb,
  ThumbsUp,
  MessageSquare,
  Edit3,
  Trash2,
  Save,
  X,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const COLUMNS = [
  {
    id: 'went_well',
    title: 'What Went Well',
    icon: Smile,
    color: 'bg-green-600',
    description: 'Things that worked well during the sprint'
  },
  {
    id: 'needs_improvement',
    title: 'What Needs Improvement',
    icon: Frown,
    color: 'bg-red-600',
    description: 'Areas that could be improved'
  },
  {
    id: 'action_items',
    title: 'Action Items',
    icon: Lightbulb,
    color: 'bg-blue-600',
    description: 'Concrete actions for the next sprint'
  }
];

const RetrospectiveBoard = ({ projectId, retrospectiveId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [activeColumn, setActiveColumn] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState('');
  const [retrospective, setRetrospective] = useState(null);

  const { user } = useAuth();
  const { on, off, joinProject, leaveProject } = useSocket();

  useEffect(() => {
    loadRetrospective();
    joinProject(projectId);

    // Set up real-time listeners
    on('retrospective_item_added', handleItemAdded);
    on('retrospective_item_updated', handleItemUpdated);
    on('retrospective_item_deleted', handleItemDeleted);
    on('retrospective_item_voted', handleItemVoted);

    return () => {
      leaveProject(projectId);
      off('retrospective_item_added', handleItemAdded);
      off('retrospective_item_updated', handleItemUpdated);
      off('retrospective_item_deleted', handleItemDeleted);
      off('retrospective_item_voted', handleItemVoted);
    };
  }, [projectId, retrospectiveId]);

  const loadRetrospective = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockRetrospective = {
        id: retrospectiveId,
        title: 'Sprint 12 Retrospective',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        sprint_number: 12
      };

      const mockItems = [
        {
          id: 1,
          text: 'Great collaboration between frontend and backend teams',
          column: 'went_well',
          author_id: user?.id,
          author_name: user?.display_name,
          votes: 3,
          voted_by: [1, 2, 3],
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          text: 'Code review process was efficient',
          column: 'went_well',
          author_id: user?.id,
          author_name: user?.display_name,
          votes: 2,
          voted_by: [1, 2],
          created_at: '2024-01-15T10:35:00Z'
        },
        {
          id: 3,
          text: 'Need better estimation for complex tasks',
          column: 'needs_improvement',
          author_id: user?.id,
          author_name: user?.display_name,
          votes: 5,
          voted_by: [1, 2, 3, 4, 5],
          created_at: '2024-01-15T10:40:00Z'
        },
        {
          id: 4,
          text: 'Implement automated testing for critical features',
          column: 'action_items',
          author_id: user?.id,
          author_name: user?.display_name,
          votes: 4,
          voted_by: [1, 2, 3, 4],
          created_at: '2024-01-15T10:45:00Z'
        }
      ];

      setRetrospective(mockRetrospective);
      setItems(mockItems);
    } catch (error) {
      console.error('Failed to load retrospective:', error);
      toast.error('Failed to load retrospective');
    } finally {
      setLoading(false);
    }
  };

  // Real-time event handlers
  const handleItemAdded = (data) => {
    if (data.retrospectiveId === retrospectiveId) {
      setItems(prev => [...prev, data.item]);
    }
  };

  const handleItemUpdated = (data) => {
    if (data.retrospectiveId === retrospectiveId) {
      setItems(prev => prev.map(item => 
        item.id === data.item.id ? data.item : item
      ));
    }
  };

  const handleItemDeleted = (data) => {
    if (data.retrospectiveId === retrospectiveId) {
      setItems(prev => prev.filter(item => item.id !== data.itemId));
    }
  };

  const handleItemVoted = (data) => {
    if (data.retrospectiveId === retrospectiveId) {
      setItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? { ...item, votes: data.votes, voted_by: data.voted_by }
          : item
      ));
    }
  };

  const handleAddItem = async (column) => {
    if (!newItemText.trim()) return;

    try {
      const newItem = {
        id: Date.now(),
        text: newItemText.trim(),
        column,
        author_id: user?.id,
        author_name: user?.display_name,
        votes: 0,
        voted_by: [],
        created_at: new Date().toISOString()
      };

      setItems(prev => [...prev, newItem]);
      setNewItemText('');
      setActiveColumn(null);
      
      // Emit real-time update
      // socket.emit('retrospective_item_added', { retrospectiveId, item: newItem });
      
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleEditItem = async (itemId) => {
    if (!editText.trim()) return;

    try {
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, text: editText.trim(), updated_at: new Date().toISOString() }
          : item
      ));
      
      setEditingItem(null);
      setEditText('');
      
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleVoteItem = async (itemId) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const hasVoted = item.voted_by.includes(user?.id);
      const newVotedBy = hasVoted 
        ? item.voted_by.filter(id => id !== user?.id)
        : [...item.voted_by, user?.id];

      setItems(prev => prev.map(i => 
        i.id === itemId 
          ? { ...i, votes: newVotedBy.length, voted_by: newVotedBy }
          : i
      ));

      toast.success(hasVoted ? 'Vote removed' : 'Vote added');
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to vote');
    }
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditText(item.text);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditText('');
  };

  const getItemsByColumn = (columnId) => {
    return items
      .filter(item => item.column === columnId)
      .sort((a, b) => b.votes - a.votes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading retrospective..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-midnight-900 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {retrospective?.title || 'Sprint Retrospective'}
            </h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
              <span className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Sprint {retrospective?.sprint_number}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {items.length} items
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(retrospective?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              retrospective?.status === 'active' 
                ? 'bg-green-600 text-green-100' 
                : 'bg-slate-600 text-slate-100'
            }`}>
              {retrospective?.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Retrospective Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COLUMNS.map(column => {
          const Icon = column.icon;
          const columnItems = getItemsByColumn(column.id);
          
          return (
            <div key={column.id} className="bg-midnight-900 rounded-lg border border-slate-700">
              {/* Column Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${column.color} mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{column.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{column.description}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {columnItems.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-4 space-y-3 min-h-[300px]">
                {/* Items */}
                {columnItems.map(item => (
                  <div key={item.id} className="bg-midnight-800 rounded-lg p-4 border border-slate-700 group">
                    {editingItem === item.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 bg-midnight-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEditing}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="p-2 text-neon-400 hover:text-neon-300 hover:bg-neon-400/10 rounded transition-colors duration-200"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-white text-sm mb-3">{item.text}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVoteItem(item.id)}
                              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors duration-200 ${
                                item.voted_by.includes(user?.id)
                                  ? 'bg-neon-600 text-white'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>{item.votes}</span>
                            </button>
                            
                            <span className="text-xs text-slate-500">
                              by {item.author_name}
                            </span>
                          </div>

                          {item.author_id === user?.id && (
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => startEditing(item)}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors duration-200"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors duration-200"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add Item */}
                {activeColumn === column.id ? (
                  <div className="bg-midnight-800 rounded-lg p-4 border border-slate-700">
                    <textarea
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      className="w-full px-3 py-2 bg-midnight-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                      rows={3}
                      placeholder={`Add a new item to ${column.title.toLowerCase()}...`}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setActiveColumn(null);
                          setNewItemText('');
                        }}
                        className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddItem(column.id)}
                        disabled={!newItemText.trim()}
                        className="px-3 py-1 bg-neon-600 hover:bg-neon-700 text-white rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveColumn(column.id)}
                    className="w-full p-4 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg text-slate-400 hover:text-white transition-colors duration-200 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RetrospectiveBoard;
