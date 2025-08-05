import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/transactions', label: 'Tx', icon: '💸' },
  { to: '/budget', label: 'Budget', icon: '💰' },
  { to: '/notifications', label: 'Notif', icon: '🔔' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 shadow">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs font-medium px-2 ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-300'
            }`
          }
        >
          <span className="text-xl mb-1">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
} 