import React from 'react';

export default function Table({ 
  headers = [], 
  children, 
  className = '',
  ...props 
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow" {...props}>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-2 ${className}`} {...props}>
      {children}
    </td>
  );
} 