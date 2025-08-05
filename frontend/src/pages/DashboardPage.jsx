import React, { useState, useEffect, useContext } from 'react';
import { AddTransaction } from '../components/AddTransaction';
import DashboardWidget from '../components/DashboardWidget';
import QuickActions from '../components/QuickActions';
import EnvironmentDebug from '../components/EnvironmentDebug';
import { AuthContext } from '../contexts/AuthContext';
import { transactionService, userService, notificationService } from '../services/backend';

export default function DashboardPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [userSummary, setUserSummary] = useState({});
  const [balanceSummary, setBalanceSummary] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // Load data from backend
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load transactions
      const txResult = await transactionService.getTransactions();
      if (txResult.success) {
        setTransactions(txResult.data);
      }

      // Load user summary
      const summaryResult = await userService.getUserSummary();
      if (summaryResult.success) {
        setUserSummary(summaryResult.data);
      }

      // Load balance summary
      const balanceResult = await userService.getUserBalanceSummary();
      if (balanceResult.success) {
        setBalanceSummary(balanceResult.data);
      }

      // Load notifications
      const notifResult = await notificationService.getNotifications(null, false);
      if (notifResult.success) {
        setNotifications(notifResult.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTransactionAdded = () => {
    loadDashboardData(); // Refresh data after adding transaction
  };

  // Widget data
  const widgets = [
    {
      id: 1,
      title: 'Total Balance',
      type: 'summary',
      data: {
        value: balanceSummary.balance_idr || 0,
        label: 'Balance',
        change: 5.2,
        currency: 'IDR'
      }
    },
    {
      id: 2,
      title: 'Monthly Income',
      type: 'summary',
      data: {
        value: balanceSummary.balance_usd || 0,
        label: 'Income',
        change: 12.5,
        currency: 'USD'
      }
    },
    {
      id: 3,
      title: 'Budget Progress',
      type: 'progress',
      data: {
        current: 75,
        target: 100,
        label: 'Monthly Budget'
      }
    },
    {
      id: 4,
      title: 'Recent Transactions',
      type: 'list',
      data: {
        items: transactions.slice(0, 5).map(tx => ({
          title: tx.description,
          subtitle: tx.category,
          value: `${tx.currency} ${tx.amount}`,
          type: tx.is_income ? 'income' : 'expense'
        }))
      }
    },
    {
      id: 5,
      title: 'Spending Trend',
      type: 'chart',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          {
            label: 'Income',
            data: [12000, 19000, 15000, 25000, 22000],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          },
          {
            label: 'Expense',
            data: [8000, 12000, 10000, 18000, 15000],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }
        ]
      },
      config: {
        type: 'line'
      }
    },
    {
      id: 6,
      title: 'Category Distribution',
      type: 'chart',
      data: {
        labels: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Other'],
        datasets: [
          {
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF'
            ]
          }
        ]
      },
      config: {
        type: 'doughnut'
      }
    }
  ];

  const handleWidgetEdit = (widgetId) => {
    console.log('Edit widget:', widgetId);
  };

  const handleWidgetDelete = (widgetId) => {
    console.log('Delete widget:', widgetId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* Environment Debug */}
      {showDebug && <EnvironmentDebug />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency:
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="IDR">IDR</option>
            <option value="USD">USD</option>
            <option value="BTC">BTC</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            title={widget.title}
            type={widget.type}
            data={widget.data}
            config={widget.config}
            onEdit={() => handleWidgetEdit(widget.id)}
            onDelete={() => handleWidgetDelete(widget.id)}
            isEditable={true}
          />
        ))}
      </div>

      {/* Recent Activities Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activities
        </h3>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((tx, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${tx.is_income ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tx.category} • {new Date(tx.timestamp / 1000000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium ${tx.is_income ? 'text-green-600' : 'text-red-600'}`}>
                {tx.is_income ? '+' : '-'}{tx.currency} {tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransaction
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
} 