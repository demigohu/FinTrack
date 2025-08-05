import React from 'react';

export default function Avatar({ 
  src,
  alt,
  initials,
  icon,
  size = 'md',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium';

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }

  if (icon) {
    return (
      <div className={`${baseClasses} ${sizeClasses[size]} ${className}`} {...props}>
        {icon}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`} {...props}>
      {initials || 'U'}
    </div>
  );
} 