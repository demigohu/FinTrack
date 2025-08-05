import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/wallets', label: 'Wallets' },
  { to: '/budget', label: 'Budget' },
  { to: '/goals', label: 'Goals' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/ai-advisor', label: 'AI Advisor' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/settings', label: 'Settings' },
  { to: '/help', label: 'Help' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <img src="/logo.svg" alt="FinTrack Logo" className="h-8 mr-2" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">FinTrack</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            {/* Placeholder icon */}
            <span className="mr-3">🔹</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
} 