import React from 'react';

export default function Switch({ 
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props 
}) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} {...props}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : ''
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
      )}
    </label>
  );
} 