import React, { useState } from 'react';

export default function Accordion({ 
  items = [], 
  allowMultiple = false,
  className = '',
  ...props 
}) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    if (allowMultiple) {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    } else {
      const newOpenItems = new Set();
      if (!openItems.has(index)) {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    }
  };

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="font-medium">{item.title}</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                openItems.has(index) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openItems.has(index) && (
            <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-3">{item.content}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 