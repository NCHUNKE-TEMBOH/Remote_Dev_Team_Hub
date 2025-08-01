import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Zap, Users, Video, GitBranch, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Login = () => {
  const { signInWithGoogle, isAuthenticated, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12">
        <div className="max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <Zap className="h-12 w-12 text-neon-500" />
            <span className="ml-3 text-3xl font-bold text-white">
              Remote Dev Team Hub
            </span>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-neon-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">
                  Real-time Collaboration
                </h3>
                <p className="text-slate-400">
                  Work together seamlessly with live updates and instant notifications.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600">
                  <Video className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">
                  Video Standups
                </h3>
                <p className="text-slate-400">
                  Daily check-ins and team meetings with integrated video calls.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-600">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">
                  Code Sharing
                </h3>
                <p className="text-slate-400">
                  Share code snippets with version history and collaborative editing.
                </p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="mt-12 p-6 bg-midnight-800 rounded-lg border border-slate-700">
            <p className="text-slate-300 italic">
              "The perfect blend of project management and team collaboration. 
              It's like having GitHub Projects, Slack, and Miro in one place."
            </p>
            <footer className="mt-4">
              <div className="flex items-center">
                <img
                  className="h-10 w-10 rounded-full"
                  src="https://ui-avatars.com/api/?name=Sarah+Chen&background=22c55e&color=fff"
                  alt="Sarah Chen"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Sarah Chen</p>
                  <p className="text-sm text-slate-400">Lead Developer</p>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 lg:flex-none lg:w-96">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Zap className="h-10 w-10 text-neon-500" />
            <span className="ml-2 text-2xl font-bold text-white">
              DevHub
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to your account to continue collaborating with your team.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="flex w-full justify-center items-center px-4 py-3 border border-slate-600 rounded-lg shadow-sm bg-midnight-800 text-white hover:bg-midnight-700 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-midnight-950 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <LoadingSpinner size="sm" className="mr-3" />
              ) : (
                <Chrome className="h-5 w-5 mr-3" />
              )}
              {isSigningIn ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-midnight-950 text-slate-400">
                    Secure authentication powered by Firebase
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                By signing in, you agree to our{' '}
                <a href="#" className="text-neon-500 hover:text-neon-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-neon-500 hover:text-neon-400">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
