import { auth } from './firebase';

// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    VERIFY: '/api/auth/verify'
  },
  
  // Users
  USERS: {
    BASE: '/api/users',
    BY_ID: (id) => `/api/users/${id}`,
    PROJECTS: (id) => `/api/users/${id}/projects`,
    TASKS: (id) => `/api/users/${id}/tasks`,
    ROLE: (id) => `/api/users/${id}/role`
  },
  
  // Projects
  PROJECTS: {
    BASE: '/api/projects',
    BY_ID: (id) => `/api/projects/${id}`,
    MEMBERS: (id) => `/api/projects/${id}/members`,
    MEMBER_BY_ID: (projectId, userId) => `/api/projects/${projectId}/members/${userId}`
  },
  
  // Tasks
  TASKS: {
    BASE: '/api/tasks',
    BY_PROJECT: (projectId) => `/api/tasks/project/${projectId}`,
    BY_ID: (id) => `/api/tasks/${id}`,
    REORDER: (projectId) => `/api/tasks/reorder/project/${projectId}`
  }
};

// Create API client with authentication
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication token
  async getAuthToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Convenience functions for common API calls
export const authAPI = {
  login: (idToken) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { idToken }),
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  getProfile: () => apiClient.get(API_ENDPOINTS.AUTH.PROFILE),
  updateProfile: (data) => apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data),
  verifyToken: (idToken) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY, { idToken })
};

export const usersAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`${API_ENDPOINTS.USERS.BASE}?${searchParams}`);
  },
  getById: (id) => apiClient.get(API_ENDPOINTS.USERS.BY_ID(id)),
  getProjects: (id) => apiClient.get(API_ENDPOINTS.USERS.PROJECTS(id)),
  getTasks: (id, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`${API_ENDPOINTS.USERS.TASKS(id)}?${searchParams}`);
  },
  updateRole: (id, role) => apiClient.put(API_ENDPOINTS.USERS.ROLE(id), { role })
};

export const projectsAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.PROJECTS.BASE),
  getById: (id) => apiClient.get(API_ENDPOINTS.PROJECTS.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.PROJECTS.BASE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.PROJECTS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.PROJECTS.BY_ID(id)),
  getMembers: (id) => apiClient.get(API_ENDPOINTS.PROJECTS.MEMBERS(id)),
  addMember: (id, data) => apiClient.post(API_ENDPOINTS.PROJECTS.MEMBERS(id), data),
  updateMember: (projectId, userId, data) => 
    apiClient.put(API_ENDPOINTS.PROJECTS.MEMBER_BY_ID(projectId, userId), data),
  removeMember: (projectId, userId) => 
    apiClient.delete(API_ENDPOINTS.PROJECTS.MEMBER_BY_ID(projectId, userId))
};

export const tasksAPI = {
  getByProject: (projectId) => apiClient.get(API_ENDPOINTS.TASKS.BY_PROJECT(projectId)),
  create: (data) => apiClient.post(API_ENDPOINTS.TASKS.BASE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.TASKS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.TASKS.BY_ID(id)),
  reorder: (projectId, tasks) => 
    apiClient.put(API_ENDPOINTS.TASKS.REORDER(projectId), { tasks })
};

export default apiClient;
