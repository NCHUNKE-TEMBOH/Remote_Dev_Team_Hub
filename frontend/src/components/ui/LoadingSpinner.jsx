import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'neon', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    neon: 'border-neon-500',
    blue: 'border-blue-500',
    white: 'border-white',
    slate: 'border-slate-500'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-2 border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <p className="mt-3 text-sm text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
