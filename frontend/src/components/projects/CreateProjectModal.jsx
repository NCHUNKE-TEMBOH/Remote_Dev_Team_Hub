import React, { useState } from 'react';
import { X, Plus, Palette } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Slate', value: '#64748b' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Project name must be less than 255 characters';
    }
    
    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-900 rounded-lg border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 bg-midnight-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors duration-200 ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-600 focus:border-neon-500 focus:ring-neon-500'
              }`}
              placeholder="Enter project name..."
              maxLength={255}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 bg-midnight-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors duration-200 ${
                errors.description 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-600 focus:border-neon-500 focus:ring-neon-500'
              }`}
              placeholder="Describe your project..."
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              <Palette className="h-4 w-4 inline mr-1" />
              Project Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange('color', color.value)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                    formData.color === color.value
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center">
              <div
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-sm text-slate-400">
                Selected: {colorOptions.find(c => c.value === formData.color)?.name || 'Custom'}
              </span>
            </div>
          </div>

          {/* Project Preview */}
          <div className="border border-slate-700 rounded-lg p-4 bg-midnight-800">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Preview</h4>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: formData.color }}
              />
              <div>
                <h5 className="font-medium text-white">
                  {formData.name || 'Project Name'}
                </h5>
                {formData.description && (
                  <p className="text-sm text-slate-400 mt-1">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-neon-600 hover:bg-neon-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
