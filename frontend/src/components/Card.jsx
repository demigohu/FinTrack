import React from 'react';

export default function Card({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) {
  const baseClasses = 'rounded-lg shadow';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outline: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
  };
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 