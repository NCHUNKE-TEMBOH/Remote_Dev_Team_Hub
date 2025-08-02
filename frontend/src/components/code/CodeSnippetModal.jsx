import React, { useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Download,
  Share2,
  X,
  Save,
  Edit3,
  Eye,
  History,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CodeSnippetModal = ({ 
  isOpen, 
  onClose, 
  snippet = null, 
  onSave,
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    code: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const { user } = useAuth();

  const languages = [
    { value: 'javascript', label: 'JavaScript', ext: 'js' },
    { value: 'typescript', label: 'TypeScript', ext: 'ts' },
    { value: 'python', label: 'Python', ext: 'py' },
    { value: 'java', label: 'Java', ext: 'java' },
    { value: 'csharp', label: 'C#', ext: 'cs' },
    { value: 'cpp', label: 'C++', ext: 'cpp' },
    { value: 'go', label: 'Go', ext: 'go' },
    { value: 'rust', label: 'Rust', ext: 'rs' },
    { value: 'php', label: 'PHP', ext: 'php' },
    { value: 'ruby', label: 'Ruby', ext: 'rb' },
    { value: 'html', label: 'HTML', ext: 'html' },
    { value: 'css', label: 'CSS', ext: 'css' },
    { value: 'sql', label: 'SQL', ext: 'sql' },
    { value: 'bash', label: 'Bash', ext: 'sh' },
    { value: 'json', label: 'JSON', ext: 'json' },
    { value: 'yaml', label: 'YAML', ext: 'yml' },
    { value: 'markdown', label: 'Markdown', ext: 'md' }
  ];

  useEffect(() => {
    if (snippet && isOpen) {
      setFormData({
        title: snippet.title || '',
        description: snippet.description || '',
        language: snippet.language || 'javascript',
        code: snippet.code || '',
        tags: snippet.tags?.join(', ') || ''
      });
    } else if (isOpen && mode === 'create') {
      setFormData({
        title: '',
        description: '',
        language: 'javascript',
        code: '',
        tags: ''
      });
    }
  }, [snippet, isOpen, mode]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const snippetData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await onSave(snippetData);
      onClose();
      toast.success(`Snippet ${mode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (error) {
      console.error('Failed to save snippet:', error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} snippet`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(formData.code);
      toast.success('Code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    const language = languages.find(lang => lang.value === formData.language);
    const filename = `${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${language?.ext || 'txt'}`;
    
    const blob = new Blob([formData.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Code downloaded');
  };

  const getLineNumbers = () => {
    const lines = formData.code.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const canEdit = mode !== 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-900 rounded-lg border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-neon-500" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {mode === 'create' ? 'Create Code Snippet' : 
                 mode === 'edit' ? 'Edit Code Snippet' : 
                 'View Code Snippet'}
              </h2>
              {snippet && (
                <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {snippet.created_by_name}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(snippet.created_at).toLocaleDateString()}
                  </span>
                  {snippet.version && (
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                      v{snippet.version}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  showPreview 
                    ? 'bg-neon-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            
            <button
              onClick={handleCopyCode}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <Copy className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Form/Details Panel */}
          <div className="w-1/3 border-r border-slate-700 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                {isReadOnly ? (
                  <p className="text-white font-medium">{formData.title}</p>
                ) : (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 bg-midnight-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors duration-200 ${
                      errors.title 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-slate-600 focus:border-neon-500 focus:ring-neon-500'
                    }`}
                    placeholder="Enter snippet title..."
                  />
                )}
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Language
                </label>
                {isReadOnly ? (
                  <p className="text-white">
                    {languages.find(lang => lang.value === formData.language)?.label || formData.language}
                  </p>
                ) : (
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                {isReadOnly ? (
                  <p className="text-slate-300">{formData.description || 'No description'}</p>
                ) : (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                    placeholder="Describe the code snippet..."
                  />
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                {isReadOnly ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
                    placeholder="react, hooks, api..."
                  />
                )}
                {!isReadOnly && (
                  <p className="mt-1 text-xs text-slate-500">Separate tags with commas</p>
                )}
              </div>

              {/* Actions */}
              {canEdit && (
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-neon-600 hover:bg-neon-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor/Viewer */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-midnight-800">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {languages.find(lang => lang.value === formData.language)?.label || 'Code'}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {formData.code.split('\n').length} lines
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {isReadOnly || showPreview ? (
                <div className="h-full overflow-auto bg-midnight-950">
                  <div className="flex">
                    <div className="bg-midnight-800 px-4 py-2 text-xs text-slate-500 border-r border-slate-700 select-none">
                      {getLineNumbers().map(num => (
                        <div key={num} className="leading-6">{num}</div>
                      ))}
                    </div>
                    <pre className="flex-1 p-4 text-sm text-slate-300 font-mono leading-6 overflow-x-auto">
                      <code>{formData.code}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <textarea
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  className={`w-full h-full p-4 bg-midnight-950 border-0 text-slate-300 font-mono text-sm leading-6 resize-none focus:outline-none focus:ring-0 ${
                    errors.code ? 'border-l-4 border-red-500' : ''
                  }`}
                  placeholder="Enter your code here..."
                  spellCheck={false}
                />
              )}
            </div>
            
            {errors.code && (
              <div className="p-2 bg-red-500/10 border-t border-red-500/20">
                <p className="text-sm text-red-400">{errors.code}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
