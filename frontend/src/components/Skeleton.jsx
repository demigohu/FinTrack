import React from 'react';

export default function Skeleton({ 
  variant = 'text',
  lines = 1,
  className = '',
  ...props 
}) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variantClasses = {
    text: 'h-4',
    title: 'h-6',
    card: 'h-32',
    avatar: 'w-10 h-10 rounded-full',
    button: 'h-10 w-20',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses.text} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />
  );
}

export function SkeletonCard({ className = '', ...props }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow ${className}`} {...props}>
      <Skeleton variant="title" className="mb-2" />
      <Skeleton variant="text" lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = '', ...props }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`} {...props}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" className="flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} variant="text" className="flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 