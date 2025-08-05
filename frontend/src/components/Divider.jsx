import React from 'react';

export default function Divider({ 
  orientation = 'horizontal',
  text,
  className = '',
  ...props 
}) {
  const baseClasses = 'border-gray-200 dark:border-gray-700';
  
  if (orientation === 'vertical') {
    return (
      <div className={`border-l h-full ${baseClasses} ${className}`} {...props} />
    );
  }

  if (text) {
    return (
      <div className={`flex items-center ${className}`} {...props}>
        <div className={`flex-1 border-t ${baseClasses}`} />
        <span className="px-3 text-sm text-gray-500 dark:text-gray-400">{text}</span>
        <div className={`flex-1 border-t ${baseClasses}`} />
      </div>
    );
  }

  return (
    <div className={`border-t ${baseClasses} ${className}`} {...props} />
  );
} 