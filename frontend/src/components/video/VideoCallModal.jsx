import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Users,
  Settings,
  Monitor,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const VideoCallModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  callId, 
  callType = 'standup',
  participants = [] 
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended
  
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const localStreamRef = useRef(null);
  const callStartTimeRef = useRef(null);
  
  const { user } = useAuth();
  const { emitCallJoined, emitCallEnded, on, off } = useSocket();

  useEffect(() => {
    if (isOpen) {
      initializeCall();
      startCallTimer();
      
      // Set up socket listeners
      on('call_joined', handleParticipantJoined);
      on('call_ended', handleCallEnded);
      on('user_left_call', handleParticipantLeft);
    }

    return () => {
      cleanup();
      off('call_joined', handleParticipantJoined);
      off('call_ended', handleCallEnded);
      off('user_left_call', handleParticipantLeft);
    };
  }, [isOpen]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Emit join call event
      emitCallJoined(projectId, callId);
      setCallStatus('connected');
      
    } catch (error) {
      console.error('Failed to initialize call:', error);
      setCallStatus('error');
    }
  };

  const startCallTimer = () => {
    callStartTimeRef.current = Date.now();
    const timer = setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleParticipantJoined = (data) => {
    console.log('Participant joined:', data);
    // In a real implementation, this would handle WebRTC peer connections
  };

  const handleParticipantLeft = (data) => {
    console.log('Participant left:', data);
    // Clean up peer connection for this participant
  };

  const handleCallEnded = (data) => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        if (localStreamRef.current && videoTrack) {
          const sender = localStreamRef.current.getVideoTracks()[0];
          // In real implementation, replace track in peer connections
          setIsScreenSharing(true);
        }
      } else {
        // Switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isAudioEnabled
        });
        
        localStreamRef.current = cameraStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const endCall = () => {
    emitCallEnded(projectId, callId);
    cleanup();
    onClose();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    callStartTimeRef.current = null;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallTypeTitle = () => {
    switch (callType) {
      case 'standup':
        return 'Daily Standup';
      case 'meeting':
        return 'Team Meeting';
      case 'review':
        return 'Code Review';
      default:
        return 'Video Call';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-midnight-900 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <Video className="h-6 w-6 text-neon-500" />
            <div>
              <h2 className="text-lg font-semibold text-white">{getCallTypeTitle()}</h2>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <span>{formatDuration(callDuration)}</span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {participants.length + 1} participants
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  callStatus === 'connected' ? 'bg-green-600 text-green-100' :
                  callStatus === 'connecting' ? 'bg-yellow-600 text-yellow-100' :
                  'bg-red-600 text-red-100'
                }`}>
                  {callStatus}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local Video */}
            <div className="relative bg-midnight-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                You {!isVideoEnabled && '(Video Off)'}
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-midnight-800">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-white font-medium">{user?.display_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Videos (Placeholder) */}
            {participants.map((participant, index) => (
              <div key={participant.id} className="relative bg-midnight-800 rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-white font-medium">{participant.name}</p>
                    <p className="text-slate-400 text-sm">Connecting...</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                  {participant.name}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - participants.length - 1) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-midnight-800 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Waiting for participants</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-midnight-900 border-t border-slate-700">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors duration-200 ${
                isAudioEnabled 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors duration-200 ${
                isVideoEnabled 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full transition-colors duration-200 ${
                isScreenSharing 
                  ? 'bg-neon-600 hover:bg-neon-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <Monitor className="h-5 w-5" />
            </button>

            <button
              onClick={endCall}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200"
            >
              <PhoneOff className="h-5 w-5" />
            </button>

            <button className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors duration-200">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
