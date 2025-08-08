import React, { useState, useEffect, useContext } from 'react';
import { AddTransaction } from '../components/AddTransaction';
import DashboardWidget from '../components/DashboardWidget';
import QuickActions from '../components/QuickActions';
import EnvironmentDebug from '../components/EnvironmentDebug';
import { AuthContext } from '../contexts/AuthContext';
import { 
  transactionService, 
  balanceService, 
  currencyService, 
  notificationService 
} from '../services/backend';

export default function DashboardPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [balanceBreakdown, setBalanceBreakdown] = useState({});
  const [portfolioSummary, setPortfolioSummary] = useState({});
  const [currencyRates, setCurrencyRates] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // Load data from backend
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load transactions
      const transactions = await transactionService.getTransactions();
      setTransactions(transactions);

      // Load balance breakdown
      const breakdown = await balanceService.getBalanceBreakdown();
      setBalanceBreakdown(breakdown);

      // Load portfolio summary
      const portfolio = await balanceService.getPortfolioSummary();
      setPortfolioSummary(portfolio);

      // Load currency rates
      const rates = await currencyService.getCurrencyRates();
      setCurrencyRates(rates);

      // Load notifications
      const notifs = await notificationService.getNotifications(null, false);
      setNotifications(notifs);
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time rates
  const fetchRates = async () => {
    try {
      const rates = await currencyService.fetchRealTimeRates();
      setCurrencyRates(rates);
      // Reload balance data with new rates
      await loadDashboardData();
    } catch (err) {
      console.error('Error fetching rates:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTransactionAdded = () => {
    loadDashboardData(); // Refresh data after adding transaction
  };

  // Convert USD to display currency
  const convertToDisplayCurrency = (usdAmount) => {
    if (currency === 'USD') return usdAmount;
    if (currency === 'IDR' && currencyRates.usd_to_idr > 0) {
      return usdAmount * currencyRates.usd_to_idr;
    }
    return usdAmount; // Fallback to USD
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'IDR': return 'Rp';
      case 'USD': return '$';
      default: return '$';
    }
  };

  // Widget data
  const widgets = [
    {
      id: 1,
      title: 'Total Balance',
      type: 'summary',
      data: {
        value: convertToDisplayCurrency(balanceBreakdown.total_usd_value || 0),
        label: 'Total Balance',
        change: 5.2,
        currency: currency,
        isNegative: balanceBreakdown.is_negative,
        negativeReason: balanceBreakdown.negative_reason
      }
    },
    {
      id: 2,
      title: 'USD Balance',
      type: 'summary',
      data: {
        value: convertToDisplayCurrency(balanceBreakdown.usd_balance || 0),
        label: 'USD Balance',
        change: 12.5,
        currency: currency
      }
    },
    {
      id: 3,
      title: 'Crypto Value',
      type: 'summary',
      data: {
        value: convertToDisplayCurrency(
          (balanceBreakdown.btc_usd_value || 0) + 
          (balanceBreakdown.eth_usd_value || 0) + 
          (balanceBreakdown.sol_usd_value || 0)
        ),
        label: 'Crypto Value',
        change: 8.3,
        currency: currency
      }
    },
    {
      id: 4,
      title: 'Portfolio Diversification',
      type: 'progress',
      data: {
        current: portfolioSummary.diversification_score || 0,
        target: 100,
        label: 'Diversification Score'
      }
    },
    {
      id: 5,
      title: 'Recent Transactions',
      type: 'list',
      data: {
        items: transactions.slice(0, 5).map(tx => ({
          title: tx.description,
          subtitle: tx.category,
          value: `${tx.currency} ${Number(tx.amount).toFixed(2)}`,
          type: tx.is_income ? 'income' : 'expense',
          source: tx.source?.[0] || 'manual'
        }))
      }
    },
    {
      id: 6,
      title: 'Asset Allocation',
      type: 'chart',
      data: {
        labels: ['USD', 'BTC', 'ETH', 'SOL'],
        datasets: [
          {
            data: [
              portfolioSummary.balance_breakdown?.usd_balance || 0,
              portfolioSummary.balance_breakdown?.btc_usd_value || 0,
              portfolioSummary.balance_breakdown?.eth_usd_value || 0,
              portfolioSummary.balance_breakdown?.sol_usd_value || 0
            ],
            backgroundColor: [
              '#10B981', // Green for USD
              '#F7931A', // Orange for BTC
              '#627EEA', // Blue for ETH
              '#9945FF'  // Purple for SOL
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
            onClick={fetchRates}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Refresh Rates
          </button>
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

      {/* Balance Breakdown Alert */}
      {balanceBreakdown.is_negative && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Negative Balance Detected
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {balanceBreakdown.negative_reason}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Currency:
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="IDR">IDR</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">USD Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${Number(balanceBreakdown.usd_balance || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">BTC Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ₿{Number(balanceBreakdown.btc_balance || 0).toFixed(8)}
              </p>
              <p className="text-xs text-gray-500">
                ${Number(balanceBreakdown.btc_usd_value || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ETH Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Ξ{Number(balanceBreakdown.eth_balance || 0).toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                ${Number(balanceBreakdown.eth_usd_value || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SOL Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ◎{Number(balanceBreakdown.sol_balance || 0).toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                ${Number(balanceBreakdown.sol_usd_value || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                    {tx.category} • {tx.source?.[0] || 'manual'} • {tx.date ? new Date(tx.date).toLocaleDateString() : new Date(Number(tx.timestamp) / 1000000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium ${tx.is_income ? 'text-green-600' : 'text-red-600'}`}>
                {tx.is_income ? '+' : '-'}{tx.currency} {Number(tx.amount).toFixed(2)}
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