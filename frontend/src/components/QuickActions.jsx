import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card.jsx';
import Button from './Button.jsx';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'add-transaction',
      title: 'Add Transaction',
      description: 'Tambah transaksi baru',
      icon: '💸',
      color: 'bg-green-500',
      route: '/transactions'
    },
    {
      id: 'budget',
      title: 'Budget',
      description: 'Kelola anggaran',
      icon: '💰',
      color: 'bg-blue-500',
      route: '/budget'
    },
    {
      id: 'goals',
      title: 'Goals',
      description: 'Set target keuangan',
      icon: '🎯',
      color: 'bg-purple-500',
      route: '/goals'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Lihat laporan',
      icon: '📊',
      color: 'bg-orange-500',
      route: '/analytics'
    },
    {
      id: 'ai-advisor',
      title: 'AI Advisor',
      description: 'Dapatkan saran',
      icon: '🤖',
      color: 'bg-indigo-500',
      route: '/ai-advisor'
    },
    {
      id: 'wallets',
      title: 'Wallets',
      description: 'Kelola wallet',
      icon: '👛',
      color: 'bg-yellow-500',
      route: '/wallets'
    }
  ];

  const handleActionClick = (route) => {
    navigate(route);
  };

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Akses cepat ke fitur utama</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.route)}
            className="group relative p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-200 pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Additional quick actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/notifications')}
          >
            🔔 Notifications
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/settings')}
          >
            ⚙️ Settings
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/help')}
          >
            ❓ Help
          </Button>
        </div>
      </div>
    </Card>
  );
} 