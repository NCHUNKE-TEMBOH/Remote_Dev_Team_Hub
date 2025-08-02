import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Phone, 
  PhoneOff, 
  Users, 
  Clock,
  X
} from 'lucide-react';

const CallNotification = ({ 
  call, 
  onAccept, 
  onDecline, 
  onDismiss,
  autoDeclineAfter = 30000 // 30 seconds
}) => {
  const [timeLeft, setTimeLeft] = useState(Math.floor(autoDeclineAfter / 1000));
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    // Auto decline timer
    const declineTimer = setTimeout(() => {
      onDecline();
    }, autoDeclineAfter);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Ringing animation
    const ringTimer = setInterval(() => {
      setIsRinging(prev => !prev);
    }, 1000);

    return () => {
      clearTimeout(declineTimer);
      clearInterval(countdownTimer);
      clearInterval(ringTimer);
    };
  }, [autoDeclineAfter, onDecline]);

  const getCallTypeInfo = () => {
    switch (call.callType) {
      case 'standup':
        return {
          title: 'Daily Standup',
          color: 'bg-blue-600',
          icon: Clock
        };
      case 'meeting':
        return {
          title: 'Team Meeting',
          color: 'bg-green-600',
          icon: Users
        };
      case 'review':
        return {
          title: 'Code Review',
          color: 'bg-purple-600',
          icon: Video
        };
      case 'retrospective':
        return {
          title: 'Sprint Retrospective',
          color: 'bg-orange-600',
          icon: Users
        };
      default:
        return {
          title: 'Video Call',
          color: 'bg-neon-600',
          icon: Video
        };
    }
  };

  const callInfo = getCallTypeInfo();
  const CallIcon = callInfo.icon;

  if (!call) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div className={`bg-midnight-900 border-2 rounded-lg shadow-2xl w-80 overflow-hidden ${
        isRinging ? 'border-neon-500 shadow-glow' : 'border-slate-700'
      } transition-all duration-300`}>
        {/* Header */}
        <div className={`${callInfo.color} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 bg-white bg-opacity-20 rounded-lg mr-3 ${
                isRinging ? 'animate-pulse' : ''
              }`}>
                <CallIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{callInfo.title}</h3>
                <p className="text-sm opacity-90">Incoming call</p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Caller Info */}
          <div className="flex items-center mb-4">
            <img
              src={call.initiatedBy?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(call.initiatedBy?.displayName || 'Unknown')}&background=22c55e&color=fff`}
              alt={call.initiatedBy?.displayName}
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <h4 className="font-medium text-white">
                {call.initiatedBy?.displayName || 'Unknown User'}
              </h4>
              <p className="text-sm text-slate-400">
                {call.title || callInfo.title}
              </p>
            </div>
          </div>

          {/* Call Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-slate-400">
              <Users className="h-4 w-4 mr-2" />
              <span>{call.participants?.length || 0} participants</span>
            </div>
            <div className="flex items-center text-sm text-slate-400">
              <Clock className="h-4 w-4 mr-2" />
              <span>Auto-decline in {timeLeft}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-1 mb-4">
            <div
              className="bg-red-500 h-1 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${((autoDeclineAfter / 1000 - timeLeft) / (autoDeclineAfter / 1000)) * 100}%`
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onDecline}
              className="flex-1 flex items-center justify-center py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center py-3 bg-neon-600 hover:bg-neon-700 text-white rounded-lg transition-colors duration-200"
            >
              <Phone className="h-4 w-4 mr-2" />
              Accept
            </button>
          </div>
        </div>

        {/* Ringing Animation */}
        {isRinging && (
          <div className="absolute inset-0 border-2 border-neon-500 rounded-lg animate-ping opacity-75 pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default CallNotification;
