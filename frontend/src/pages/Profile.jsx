import React from 'react';
import { User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      <div className="card p-6">
        <div className="flex items-center mb-6">
          <img
            className="h-16 w-16 rounded-full"
            src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name || 'User')}&background=22c55e&color=fff`}
            alt={user?.display_name}
          />
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-white">{user?.display_name}</h2>
            <p className="text-slate-400">{user?.email}</p>
            <p className="text-sm text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="text-center py-8">
          <Settings className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">
            Profile settings coming soon
          </h3>
          <p className="text-slate-500">
            This page will allow you to update your profile information and preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
