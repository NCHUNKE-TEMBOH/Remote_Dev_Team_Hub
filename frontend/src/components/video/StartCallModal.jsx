import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  X, 
  Play,
  UserPlus,
  Settings
} from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../config/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const StartCallModal = ({ isOpen, onClose, projectId, onCallStarted }) => {
  const [callType, setCallType] = useState('standup');
  const [callTitle, setCallTitle] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);

  const { user } = useAuth();
  const { emitCallInitiated } = useSocket();

  const callTypes = [
    {
      id: 'standup',
      name: 'Daily Standup',
      description: 'Quick team sync and progress updates',
      icon: Clock,
      duration: '15 min',
      color: 'bg-blue-600'
    },
    {
      id: 'meeting',
      name: 'Team Meeting',
      description: 'General team discussion and planning',
      icon: Users,
      duration: '30-60 min',
      color: 'bg-green-600'
    },
    {
      id: 'review',
      name: 'Code Review',
      description: 'Review code changes and discuss implementation',
      icon: Video,
      duration: '30 min',
      color: 'bg-purple-600'
    },
    {
      id: 'retrospective',
      name: 'Sprint Retrospective',
      description: 'Reflect on the sprint and plan improvements',
      icon: Calendar,
      duration: '45 min',
      color: 'bg-orange-600'
    }
  ];

  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectMembers();
      setDefaultTitle();
    }
  }, [isOpen, projectId, callType]);

  const loadProjectMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await projectsAPI.getMembers(projectId);
      setProjectMembers(response.members || []);
      // Select all members by default
      setSelectedMembers(response.members?.map(m => m.user_id) || []);
    } catch (error) {
      console.error('Failed to load project members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const setDefaultTitle = () => {
    const selectedType = callTypes.find(type => type.id === callType);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    setCallTitle(`${selectedType?.name} - ${timeStr}`);
  };

  const handleStartCall = async () => {
    if (!callTitle.trim()) {
      return;
    }

    setLoading(true);
    try {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Emit call initiation to all project members
      emitCallInitiated(projectId, callId, callType);
      
      // Start the call
      onCallStarted({
        callId,
        callType,
        title: callTitle.trim(),
        participants: selectedMembers,
        projectId
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to start call:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    setSelectedMembers(projectMembers.map(m => m.user_id));
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-900 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Video className="h-5 w-5 mr-2" />
            Start Video Call
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Call Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Call Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {callTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setCallType(type.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      callType === type.id
                        ? 'border-neon-500 bg-neon-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${type.color} mr-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{type.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{type.description}</p>
                        <p className="text-xs text-slate-500 mt-2">~{type.duration}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Call Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Call Title
            </label>
            <input
              type="text"
              value={callTitle}
              onChange={(e) => setCallTitle(e.target.value)}
              className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
              placeholder="Enter call title..."
            />
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">
                Invite Participants ({selectedMembers.length} selected)
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllMembers}
                  className="text-xs text-neon-400 hover:text-neon-300"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllMembers}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" text="Loading members..." />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-slate-700 rounded-lg">
                {projectMembers.map((member) => (
                  <label
                    key={member.user_id}
                    className="flex items-center p-3 hover:bg-midnight-800 cursor-pointer border-b border-slate-700 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.user_id)}
                      onChange={() => toggleMemberSelection(member.user_id)}
                      className="w-4 h-4 text-neon-600 bg-midnight-800 border-slate-600 rounded focus:ring-neon-500 focus:ring-2"
                    />
                    <div className="ml-3 flex items-center">
                      <img
                        src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.display_name)}&background=22c55e&color=fff`}
                        alt={member.display_name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-white font-medium">{member.display_name}</p>
                        <p className="text-sm text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Call Preview */}
          <div className="bg-midnight-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Call Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-white">{callTypes.find(t => t.id === callType)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Participants:</span>
                <span className="text-white">{selectedMembers.length} members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-white">{callTypes.find(t => t.id === callType)?.duration}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleStartCall}
              disabled={loading || !callTitle.trim() || selectedMembers.length === 0}
              className="px-4 py-2 bg-neon-600 hover:bg-neon-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Call
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartCallModal;
