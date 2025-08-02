import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const UserProfile = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    photo_url: user?.photo_url || ''
  });

  const handleSave = async () => {
    if (!formData.display_name.trim()) {
      toast.error('Display name is required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        display_name: formData.display_name.trim(),
        photo_url: formData.photo_url
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: user?.display_name || '',
      photo_url: user?.photo_url || ''
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-red-100';
      case 'project_manager':
        return 'bg-purple-600 text-purple-100';
      case 'team_lead':
        return 'bg-blue-600 text-blue-100';
      case 'team_member':
        return 'bg-slate-600 text-slate-100';
      default:
        return 'bg-slate-600 text-slate-100';
    }
  };

  const formatRole = (role) => {
    return role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Team Member';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-900 rounded-lg border border-slate-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={
                  isEditing && formData.photo_url 
                    ? formData.photo_url 
                    : user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name || 'User')}&background=22c55e&color=fff&size=128`
                }
                alt={user?.display_name}
                className="w-24 h-24 rounded-full border-4 border-slate-700"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-neon-600 hover:bg-neon-700 text-white rounded-full transition-colors duration-200">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {isEditing && (
              <div className="mt-4 w-full">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                  className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                  placeholder="Enter your display name"
                />
              ) : (
                <p className="text-white font-medium">{user?.display_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <p className="text-slate-400">{user?.email}</p>
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                Role
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
                {formatRole(user?.role)}
              </span>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Member Since
              </label>
              <p className="text-slate-400">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !formData.display_name.trim()}
                className="px-4 py-2 bg-neon-600 hover:bg-neon-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
