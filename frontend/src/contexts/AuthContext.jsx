import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../config/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get ID token and authenticate with backend
          const idToken = await firebaseUser.getIdToken();
          const response = await authAPI.login(idToken);
          setUser(response.user);
        } catch (error) {
          console.error('Authentication error:', error);
          toast.error('Authentication failed');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Authenticate with backend
      const response = await authAPI.login(idToken);
      setUser(response.user);
      
      toast.success(`Welcome, ${response.user.display_name}!`);
      return response.user;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from backend
      try {
        await authAPI.logout();
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
      
      // Sign out from Firebase
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
      toast.success('Profile updated successfully');
      return response.user;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Get current user's ID token
  const getIdToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        const response = await authAPI.getProfile();
        setUser(response.user);
        return response.user;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is team lead or higher
  const isTeamLead = () => {
    return hasRole(['team_lead', 'project_manager', 'admin']);
  };

  // Check if user is project manager or higher
  const isProjectManager = () => {
    return hasRole(['project_manager', 'admin']);
  };

  const value = {
    // User state
    user,
    firebaseUser,
    loading,
    
    // Authentication methods
    signInWithGoogle,
    logout,
    updateProfile,
    getIdToken,
    refreshUser,
    
    // Role checking methods
    hasRole,
    isAdmin,
    isTeamLead,
    isProjectManager,
    
    // Computed properties
    isAuthenticated: !!user,
    isFirebaseAuthenticated: !!firebaseUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
