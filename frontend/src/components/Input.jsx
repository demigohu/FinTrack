import React from 'react';

export default function Input({ 
  type = 'text',
  variant = 'default',
  size = 'md',
  error = false,
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500',
    error: 'border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const isDisabled = disabled;

  return (
    <input
      type={type}
      className={`${baseClasses} ${variantClasses[error ? 'error' : variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    />
  );
} 