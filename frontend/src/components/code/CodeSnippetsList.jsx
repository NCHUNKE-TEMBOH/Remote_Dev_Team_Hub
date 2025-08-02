import React, { useState, useEffect } from 'react';
import {
  Code,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Download,
  Star,
  StarOff,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CodeSnippetModal from './CodeSnippetModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CodeSnippetsList = ({ projectId }) => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [showModal, setShowModal] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const { user } = useAuth();

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp',
    'go', 'rust', 'php', 'ruby', 'html', 'css', 'sql', 'bash'
  ];

  useEffect(() => {
    loadSnippets();
  }, [projectId]);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockSnippets = [
        {
          id: 1,
          title: 'React Custom Hook for API Calls',
          description: 'A reusable hook for making API calls with loading states',
          language: 'javascript',
          code: `import { useState, useEffect } from 'react';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};`,
          tags: ['react', 'hooks', 'api'],
          created_by: user?.id,
          created_by_name: user?.display_name,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          version: 1,
          is_favorite: false
        },
        {
          id: 2,
          title: 'Python Data Validation',
          description: 'Utility functions for validating user input data',
          language: 'python',
          code: `def validate_email(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number format"""
    import re
    pattern = r'^\\+?1?\\d{9,15}$'
    return re.match(pattern, phone) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain lowercase letter"
    if not re.search(r'\\d', password):
        return False, "Password must contain number"
    return True, "Password is valid"`,
          tags: ['python', 'validation', 'utility'],
          created_by: user?.id,
          created_by_name: user?.display_name,
          created_at: '2024-01-14T15:45:00Z',
          updated_at: '2024-01-14T15:45:00Z',
          version: 1,
          is_favorite: true
        }
      ];
      setSnippets(mockSnippets);
    } catch (error) {
      console.error('Failed to load snippets:', error);
      toast.error('Failed to load code snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnippet = () => {
    setSelectedSnippet(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleViewSnippet = (snippet) => {
    setSelectedSnippet(snippet);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditSnippet = (snippet) => {
    setSelectedSnippet(snippet);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      // Mock delete - replace with actual API call
      setSnippets(prev => prev.filter(s => s.id !== snippetId));
      toast.success('Snippet deleted successfully');
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      toast.error('Failed to delete snippet');
    }
  };

  const handleSaveSnippet = async (snippetData) => {
    try {
      if (modalMode === 'create') {
        // Mock create - replace with actual API call
        const newSnippet = {
          id: Date.now(),
          ...snippetData,
          created_by: user?.id,
          created_by_name: user?.display_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          is_favorite: false
        };
        setSnippets(prev => [newSnippet, ...prev]);
      } else {
        // Mock update - replace with actual API call
        setSnippets(prev => prev.map(s => 
          s.id === selectedSnippet.id 
            ? { ...s, ...snippetData, updated_at: new Date().toISOString() }
            : s
        ));
      }
    } catch (error) {
      console.error('Failed to save snippet:', error);
      throw error;
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Failed to copy code');
    }
  };

  const toggleFavorite = async (snippetId) => {
    try {
      setSnippets(prev => prev.map(s => 
        s.id === snippetId ? { ...s, is_favorite: !s.is_favorite } : s
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  // Filter and sort snippets
  const filteredSnippets = snippets
    .filter(snippet => {
      const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLanguage = filterLanguage === 'all' || snippet.language === filterLanguage;
      const matchesAuthor = filterAuthor === 'all' || 
                           (filterAuthor === 'me' && snippet.created_by === user?.id);
      return matchesSearch && matchesLanguage && matchesAuthor;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'language':
          return a.language.localeCompare(b.language);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'updated_at':
          return new Date(b.updated_at) - new Date(a.updated_at);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading code snippets..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Code Snippets
          </h2>
          <p className="text-slate-400 mt-1">
            Share and collaborate on code snippets with your team
          </p>
        </div>
        
        <button 
          onClick={handleCreateSnippet}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-midnight-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          />
        </div>

        <div className="flex gap-4">
          {/* Language Filter */}
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          {/* Author Filter */}
          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          >
            <option value="all">All Authors</option>
            <option value="me">My Snippets</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-midnight-800 border border-slate-600 rounded-lg text-white focus:border-neon-500 focus:ring-1 focus:ring-neon-500 transition-colors duration-200"
          >
            <option value="created_at">Date Created</option>
            <option value="updated_at">Last Updated</option>
            <option value="title">Title</option>
            <option value="language">Language</option>
          </select>
        </div>
      </div>

      {/* Snippets Grid */}
      {filteredSnippets.length === 0 ? (
        <div className="text-center py-12">
          <Code className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">
            {snippets.length === 0 ? 'No code snippets yet' : 'No snippets found'}
          </h3>
          <p className="text-slate-500 mb-6">
            {snippets.length === 0 
              ? 'Create your first code snippet to start sharing with your team.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {snippets.length === 0 && (
            <button 
              onClick={handleCreateSnippet}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Snippet
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSnippets.map(snippet => (
            <div key={snippet.id} className="card-hover p-6 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-neon-400 transition-colors duration-200">
                    {snippet.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                      {snippet.language}
                    </span>
                    <span className="text-xs text-slate-500">
                      v{snippet.version}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleFavorite(snippet.id)}
                  className="p-1 text-slate-400 hover:text-yellow-400 transition-colors duration-200"
                >
                  {snippet.is_favorite ? (
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Description */}
              {snippet.description && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {snippet.description}
                </p>
              )}

              {/* Tags */}
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {snippet.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                  {snippet.tags.length > 3 && (
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">
                      +{snippet.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Code Preview */}
              <div className="bg-midnight-950 rounded border border-slate-700 p-3 mb-4">
                <pre className="text-xs text-slate-300 font-mono overflow-hidden">
                  <code className="line-clamp-3">
                    {snippet.code}
                  </code>
                </pre>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-500">
                  <User className="h-3 w-3 mr-1" />
                  <span>{snippet.created_by_name}</span>
                  <Calendar className="h-3 w-3 ml-3 mr-1" />
                  <span>{new Date(snippet.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleViewSnippet(snippet)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors duration-200"
                    title="View"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  
                  {snippet.created_by === user?.id && (
                    <button
                      onClick={() => handleEditSnippet(snippet)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleCopyCode(snippet.code)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors duration-200"
                    title="Copy"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  
                  {snippet.created_by === user?.id && (
                    <button
                      onClick={() => handleDeleteSnippet(snippet.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CodeSnippetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        snippet={selectedSnippet}
        onSave={handleSaveSnippet}
        mode={modalMode}
      />
    </div>
  );
};

export default CodeSnippetsList;
