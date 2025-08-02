import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Users,
  MessageSquare,
  Play,
  Archive,
  Search,
  Filter,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TeamLeadOnly } from '../auth/RoleGuard';
import CreateRetrospectiveModal from './CreateRetrospectiveModal';
import RetrospectiveBoard from './RetrospectiveBoard';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const RetrospectivesList = ({ projectId }) => {
  const [retrospectives, setRetrospectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRetrospective, setSelectedRetrospective] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { user } = useAuth();

  useEffect(() => {
    loadRetrospectives();
  }, [projectId]);

  const loadRetrospectives = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockRetrospectives = [
        {
          id: 1,
          title: 'Sprint 12 Retrospective',
          sprint_number: 12,
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          created_by: user?.id,
          created_by_name: user?.display_name,
          participants_count: 5,
          items_count: 12,
          votes_count: 28
        },
        {
          id: 2,
          title: 'Sprint 11 Retrospective',
          sprint_number: 11,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          created_by: user?.id,
          created_by_name: user?.display_name,
          participants_count: 4,
          items_count: 8,
          votes_count: 15
        },
        {
          id: 3,
          title: 'Sprint 10 Retrospective',
          sprint_number: 10,
          status: 'archived',
          created_at: '2023-12-18T10:00:00Z',
          created_by: user?.id,
          created_by_name: user?.display_name,
          participants_count: 6,
          items_count: 15,
          votes_count: 32
        }
      ];
      setRetrospectives(mockRetrospectives);
    } catch (error) {
      console.error('Failed to load retrospectives:', error);
      toast.error('Failed to load retrospectives');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRetrospective = async (retrospectiveData) => {
    try {
      const newRetrospective = {
        id: Date.now(),
        ...retrospectiveData,
        created_by: user?.id,
        created_by_name: user?.display_name,
        created_at: new Date().toISOString(),
        participants_count: 0,
        items_count: 0,
        votes_count: 0
      };
      
      setRetrospectives(prev => [newRetrospective, ...prev]);
      setShowCreateModal(false);
      toast.success('Retrospective created successfully');
    } catch (error) {
      console.error('Failed to create retrospective:', error);
      toast.error('Failed to create retrospective');
    }
  };

  const handleOpenRetrospective = (retrospective) => {
    setSelectedRetrospective(retrospective);
  };

  const handleCloseRetrospective = () => {
    setSelectedRetrospective(null);
  };

  const handleArchiveRetrospective = async (retrospectiveId) => {
    if (!window.confirm('Are you sure you want to archive this retrospective?')) {
      return;
    }

    try {
      setRetrospectives(prev => prev.map(retro => 
        retro.id === retrospectiveId 
          ? { ...retro, status: 'archived' }
          : retro
      ));
      toast.success('Retrospective archived successfully');
    } catch (error) {
      console.error('Failed to archive retrospective:', error);
      toast.error('Failed to archive retrospective');
    }
  };

  // Filter retrospectives
  const filteredRetrospectives = retrospectives
    .filter(retro => {
      const matchesSearch = retro.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           retro.sprint_number.toString().includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || retro.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-green-100';
      case 'completed':
        return 'bg-blue-600 text-blue-100';
      case 'archived':
        return 'bg-slate-600 text-slate-100';
      default:
        return 'bg-slate-600 text-slate-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (selectedRetrospective) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCloseRetrospective}
            className="btn-ghost flex items-center"
          >
            ← Back to Retrospectives
          </button>
        </div>
        
        <RetrospectiveBoard 
          projectId={projectId}
          retrospectiveId={selectedRetrospective.id}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading retrospectives..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Sprint Retrospectives
          </h2>
          <p className="text-slate-400 mt-1">
            Reflect on sprints and plan improvements with your team
          </p>
        </div>
        
        <TeamLeadOnly>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Retrospective
          </button>
        </TeamLeadOnly>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search retrospectives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Retrospectives List */}
      {filteredRetrospectives.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">
            {retrospectives.length === 0 ? 'No retrospectives yet' : 'No retrospectives found'}
          </h3>
          <p className="text-slate-500 mb-6">
            {retrospectives.length === 0 
              ? 'Create your first retrospective to start reflecting on your sprints.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {retrospectives.length === 0 && (
            <TeamLeadOnly>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Retrospective
              </button>
            </TeamLeadOnly>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRetrospectives.map(retrospective => (
            <div key={retrospective.id} className="card-hover p-6 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg truncate group-hover:text-neon-400 transition-colors duration-200">
                    {retrospective.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                      Sprint {retrospective.sprint_number}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(retrospective.status)}`}>
                      {retrospective.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{retrospective.items_count}</div>
                  <div className="text-xs text-slate-400">Items</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{retrospective.votes_count}</div>
                  <div className="text-xs text-slate-400">Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{retrospective.participants_count}</div>
                  <div className="text-xs text-slate-400">People</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(retrospective.created_at)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenRetrospective(retrospective)}
                    className="flex items-center px-3 py-1 bg-neon-600 hover:bg-neon-700 text-white rounded text-sm transition-colors duration-200"
                  >
                    {retrospective.status === 'active' ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Open
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        View
                      </>
                    )}
                  </button>
                  
                  {retrospective.status !== 'archived' && retrospective.created_by === user?.id && (
                    <button
                      onClick={() => handleArchiveRetrospective(retrospective.id)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors duration-200"
                      title="Archive"
                    >
                      <Archive className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateRetrospectiveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRetrospective}
      />
    </div>
  );
};

export default RetrospectivesList;
