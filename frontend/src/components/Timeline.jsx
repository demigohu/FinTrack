import React from 'react';

export default function Timeline({ 
  items = [], 
  className = '',
  ...props 
}) {
  return (
    <div className={`flow-root ${className}`} {...props}>
      <ul className="-mb-8">
        {items.map((item, index) => (
          <li key={index}>
            <div className="relative pb-8">
              {index !== items.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                    item.variant === 'success' ? 'bg-green-500' :
                    item.variant === 'warning' ? 'bg-yellow-500' :
                    item.variant === 'danger' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}>
                    {item.icon || (
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.content}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    <time dateTime={item.dateTime}>{item.date}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 