import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ 
  items = [], 
  separator = '/',
  className = '',
  ...props 
}) {
  return (
    <nav className={`flex ${className}`} {...props}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400 dark:text-gray-500">
                {separator}
              </span>
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 