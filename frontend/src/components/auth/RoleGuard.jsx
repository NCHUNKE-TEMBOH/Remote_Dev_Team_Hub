import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Lock } from 'lucide-react';

/**
 * Component that conditionally renders children based on user roles
 * @param {string|string[]} allowedRoles - Role or array of roles that can access the content
 * @param {React.ReactNode} children - Content to render if user has permission
 * @param {React.ReactNode} fallback - Content to render if user doesn't have permission
 * @param {boolean} showFallback - Whether to show fallback content or hide completely
 */
const RoleGuard = ({ 
  allowedRoles, 
  children, 
  fallback = null, 
  showFallback = false 
}) => {
  const { user, hasRole } = useAuth();

  // If no user is logged in, don't render anything
  if (!user) {
    return showFallback ? (
      fallback || (
        <div className="flex items-center justify-center p-4 bg-midnight-800 border border-slate-700 rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Authentication required</p>
          </div>
        </div>
      )
    ) : null;
  }

  // Check if user has required role
  const hasPermission = hasRole(allowedRoles);

  if (hasPermission) {
    return children;
  }

  // User doesn't have permission
  if (showFallback) {
    return fallback || (
      <div className="flex items-center justify-center p-4 bg-midnight-800 border border-slate-700 rounded-lg">
        <div className="text-center">
          <Shield className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Insufficient permissions</p>
          <p className="text-slate-500 text-xs mt-1">
            Required role: {Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Hook version of RoleGuard for conditional logic in components
 */
export const useRoleGuard = (allowedRoles) => {
  const { user, hasRole } = useAuth();
  
  if (!user) return false;
  return hasRole(allowedRoles);
};

/**
 * Higher-order component version of RoleGuard
 */
export const withRoleGuard = (allowedRoles, fallbackComponent = null) => {
  return (WrappedComponent) => {
    const GuardedComponent = (props) => {
      return (
        <RoleGuard 
          allowedRoles={allowedRoles} 
          fallback={fallbackComponent}
          showFallback={!!fallbackComponent}
        >
          <WrappedComponent {...props} />
        </RoleGuard>
      );
    };
    
    GuardedComponent.displayName = `withRoleGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
    return GuardedComponent;
  };
};

/**
 * Component for admin-only content
 */
export const AdminOnly = ({ children, fallback, showFallback = false }) => (
  <RoleGuard 
    allowedRoles="admin" 
    fallback={fallback} 
    showFallback={showFallback}
  >
    {children}
  </RoleGuard>
);

/**
 * Component for team lead and above content
 */
export const TeamLeadOnly = ({ children, fallback, showFallback = false }) => (
  <RoleGuard 
    allowedRoles={['team_lead', 'project_manager', 'admin']} 
    fallback={fallback} 
    showFallback={showFallback}
  >
    {children}
  </RoleGuard>
);

/**
 * Component for project manager and above content
 */
export const ProjectManagerOnly = ({ children, fallback, showFallback = false }) => (
  <RoleGuard 
    allowedRoles={['project_manager', 'admin']} 
    fallback={fallback} 
    showFallback={showFallback}
  >
    {children}
  </RoleGuard>
);

export default RoleGuard;
