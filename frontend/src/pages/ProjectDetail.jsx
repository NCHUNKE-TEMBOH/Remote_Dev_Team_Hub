import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  BarChart3,
  Video,
  MessageSquare,
  Code,
  Target
} from 'lucide-react';
import KanbanBoard from '../components/kanban/KanbanBoard';
import VideoCallModal from '../components/video/VideoCallModal';
import StartCallModal from '../components/video/StartCallModal';
import CallNotification from '../components/video/CallNotification';
import CodeSnippetsList from '../components/code/CodeSnippetsList';
import RetrospectivesList from '../components/retrospective/RetrospectivesList';
import { projectsAPI } from '../config/api';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');

  // Video call states
  const [showStartCallModal, setShowStartCallModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const { on, off } = useSocket();

  useEffect(() => {
    loadProject();

    // Set up call event listeners
    on('call_initiated', handleIncomingCall);
    on('call_ended', handleCallEnded);

    return () => {
      off('call_initiated', handleIncomingCall);
      off('call_ended', handleCallEnded);
    };
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(projectId);
      setProject(response.project);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  // Video call handlers
  const handleIncomingCall = (callData) => {
    if (callData.projectId === parseInt(projectId)) {
      setIncomingCall(callData);
      toast.info(`Incoming ${callData.callType} call from ${callData.initiatedBy.displayName}`);
    }
  };

  const handleCallEnded = (callData) => {
    setCurrentCall(null);
    setShowVideoCall(false);
    setIncomingCall(null);
    toast.info('Call ended');
  };

  const handleStartCall = (callData) => {
    setCurrentCall(callData);
    setShowVideoCall(true);
    setShowStartCallModal(false);
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setCurrentCall(incomingCall);
      setShowVideoCall(true);
      setIncomingCall(null);
    }
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
    toast.info('Call declined');
  };

  const handleEndCall = () => {
    setCurrentCall(null);
    setShowVideoCall(false);
  };

  const tabs = [
    { id: 'board', name: 'Board', icon: BarChart3 },
    { id: 'code', name: 'Code', icon: Code },
    { id: 'retrospectives', name: 'Retrospectives', icon: Target },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-400 mb-2">
          Project not found
        </h3>
        <p className="text-slate-500 mb-4">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          to="/projects"
          className="btn-primary inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project Header */}
      <div className="bg-midnight-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/projects"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-slate-400 mt-1">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStartCallModal(true)}
              className="btn-ghost flex items-center"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Call
            </button>

            <button className="btn-ghost flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="flex items-center space-x-6 text-sm text-slate-400">
          <span>{project.task_count || 0} tasks</span>
          <span>{project.member_count || 0} members</span>
          <span>Created by {project.created_by_name}</span>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
                  ? 'bg-neon-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'board' && (
          <div className="h-full p-6">
            <KanbanBoard projectId={projectId} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-full p-6">
            <CodeSnippetsList projectId={projectId} />
          </div>
        )}

        {activeTab === 'retrospectives' && (
          <div className="h-full p-6">
            <RetrospectivesList projectId={projectId} />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                Calendar view coming soon
              </h3>
              <p className="text-slate-500">
                View tasks and deadlines in a calendar format.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                Team management coming soon
              </h3>
              <p className="text-slate-500">
                Manage project members and their roles.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                Team chat coming soon
              </h3>
              <p className="text-slate-500">
                Real-time messaging for project collaboration.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modals */}
      <StartCallModal
        isOpen={showStartCallModal}
        onClose={() => setShowStartCallModal(false)}
        projectId={projectId}
        onCallStarted={handleStartCall}
      />

      <VideoCallModal
        isOpen={showVideoCall}
        onClose={handleEndCall}
        projectId={projectId}
        callId={currentCall?.callId}
        callType={currentCall?.callType}
        participants={currentCall?.participants || []}
      />

      {/* Incoming Call Notification */}
      {incomingCall && (
        <CallNotification
          call={incomingCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
          onDismiss={handleDeclineCall}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
