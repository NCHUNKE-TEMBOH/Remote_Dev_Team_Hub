import React, { useState } from 'react';
import { X, Plus, Target, Calendar, Users } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const CreateRetrospectiveModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    sprint_number: '',
    description: '',
    template: 'standard'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const templates = [
    {
      id: 'standard',
      name: 'Standard Retrospective',
      description: 'What went well, what needs improvement, and action items',
      columns: ['What Went Well', 'What Needs Improvement', 'Action Items']
    },
    {
      id: 'starfish',
      name: 'Starfish Retrospective',
      description: 'Start doing, stop doing, continue doing, more of, less of',
      columns: ['Start Doing', 'Stop Doing', 'Continue Doing', 'More Of', 'Less Of']
    },
    {
      id: 'glad_sad_mad',
      name: 'Glad, Sad, Mad',
      description: 'What made you glad, sad, or mad during the sprint',
      columns: ['Glad', 'Sad', 'Mad']
    },
    {
      id: 'four_ls',
      name: '4 Ls Retrospective',
      description: 'Liked, learned, lacked, longed for',
      columns: ['Liked', 'Learned', 'Lacked', 'Longed For']
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.sprint_number || formData.sprint_number < 1) {
      newErrors.sprint_number = 'Valid sprint number is required';
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
        title: formData.title.trim(),
        sprint_number: parseInt(formData.sprint_number),
        description: formData.description.trim() || null,
        template: formData.template,
        status: 'active'
      });
      
      // Reset form
      setFormData({
        title: '',
        sprint_number: '',
        description: '',
        template: 'standard'
      });
    } catch (error) {
      console.error('Failed to create retrospective:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate title when sprint number changes
    if (field === 'sprint_number' && value) {
      setFormData(prev => ({
        ...prev,
        title: `Sprint ${value} Retrospective`
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-900 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Create Sprint Retrospective
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
          {/* Sprint Number */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sprint Number *
            </label>
            <input
              type="number"
              min="1"
              value={formData.sprint_number}
              onChange={(e) => handleChange('sprint_number', e.target.value)}
              className={`w-full px-3 py-2 bg-midnight-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors duration-200 ${
                errors.sprint_number 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-600 focus:border-neon-500 focus:ring-neon-500'
              }`}
              placeholder="Enter sprint number..."
              autoFocus
            />
            {errors.sprint_number && (
              <p className="mt-1 text-sm text-red-400">{errors.sprint_number}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 bg-midnight-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors duration-200 ${
                errors.title 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-600 focus:border-neon-500 focus:ring-neon-500'
              }`}
              placeholder="Enter retrospective title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
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
              rows={3}
              className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
              placeholder="Optional description for this retrospective..."
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Retrospective Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleChange('template', template.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    formData.template === template.id
                      ? 'border-neon-500 bg-neon-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <h3 className="font-medium text-white mb-2">{template.name}</h3>
                  <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.columns.map((column, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        {column}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-midnight-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Retrospective Preview
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Sprint:</span>
                <span className="text-white">
                  {formData.sprint_number ? `Sprint ${formData.sprint_number}` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="text-white">
                  {formData.title || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Template:</span>
                <span className="text-white">
                  {templates.find(t => t.id === formData.template)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Columns:</span>
                <span className="text-white">
                  {templates.find(t => t.id === formData.template)?.columns.length}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              disabled={loading || !formData.title.trim() || !formData.sprint_number}
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
                  Create Retrospective
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRetrospectiveModal;
