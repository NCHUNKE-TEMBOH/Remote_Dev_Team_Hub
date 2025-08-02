import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Hook to check if user has specific permissions
 */
export const usePermissions = () => {
  const { user, hasRole, isAdmin, isTeamLead, isProjectManager } = useAuth();
  
  const canManageUsers = () => isAdmin();
  
  const canManageProjects = () => isProjectManager() || isAdmin();
  
  const canManageTasks = (task) => {
    if (!user || !task) return false;
    
    // User can manage their own tasks
    if (task.assigned_to === user.id || task.created_by === user.id) {
      return true;
    }
    
    // Team leads and above can manage all tasks
    return isTeamLead();
  };
  
  const canDeleteTask = (task) => {
    if (!user || !task) return false;
    
    // Only task creator or admins can delete tasks
    return task.created_by === user.id || isAdmin();
  };
  
  const canInviteMembers = () => isTeamLead();
  
  const canManageProjectSettings = (project) => {
    if (!user || !project) return false;
    
    // Project creator or admins can manage settings
    return project.created_by === user.id || isAdmin();
  };
  
  return {
    canManageUsers,
    canManageProjects,
    canManageTasks,
    canDeleteTask,
    canInviteMembers,
    canManageProjectSettings,
    hasRole,
    isAdmin,
    isTeamLead,
    isProjectManager
  };
};

export default useAuth;
