import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { transactionService, userService } from '../services/backend';
import ChartComponent from '../components/ChartComponent.jsx';
import CurrencySelector from '../components/CurrencySelector.jsx';
import Select from '../components/Select.jsx';
import Card from '../components/Card.jsx';
import Tabs from '../components/Tabs.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

export default function AnalyticsPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [reportIncome, setReportIncome] = useState(0);
  const [reportExpense, setReportExpense] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterChain, setFilterChain] = useState('ALL');

  // Load analytics data from backend
  const loadAnalyticsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load transactions
      const txResult = await transactionService.getTransactions();
      if (txResult.success) {
        setTransactions(txResult.data);
      }

      // Load income and expense reports
      const incomeResult = await transactionService.getTotalIncome();
      if (incomeResult.success) {
        setReportIncome(incomeResult.data);
      }

      const expenseResult = await transactionService.getTotalExpense();
      if (expenseResult.success) {
        setReportExpense(expenseResult.data);
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [currency]);

  // Breakdown kategori
  const categoryBreakdown = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (!tx.is_income) { // Only count expenses for category breakdown
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      }
      return acc;
    }, {});
  }, [transactions]);

  // Data untuk bar chart income vs expense
  const barChartData = {
    labels: ['Income', 'Expense'],
    datasets: [{
      label: 'Amount',
      data: [reportIncome || 0, reportExpense || 0],
      backgroundColor: [
        '#10B981', // Green for income
        '#EF4444', // Red for expense
      ],
      borderWidth: 1
    }]
  };

  // Data untuk doughnut chart kategori
  const doughnutChartData = {
    labels: Object.keys(categoryBreakdown),
    datasets: [{
      data: Object.values(categoryBreakdown),
      backgroundColor: [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Monthly trend data
  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [12000, 15000, 13000, 18000, 16000, 20000],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Expense',
        data: [8000, 12000, 10000, 15000, 14000, 16000],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  };

  const tabs = [
    {
      label: 'Income vs Expense',
      content: (
        <Card>
          <div className="font-semibold mb-2">Income vs Expense</div>
          <div className="mb-2">
            <span className="text-green-600">Income: {currency} {reportIncome?.toLocaleString() || 0}</span> | 
            <span className="text-red-600"> Expense: {currency} {reportExpense?.toLocaleString() || 0}</span>
          </div>
          <ChartComponent type="bar" data={barChartData} />
        </Card>
      )
    },
    {
      label: 'Category Breakdown',
      content: (
        <Card>
          <div className="font-semibold mb-2">Category Breakdown</div>
          <ChartComponent type="doughnut" data={doughnutChartData} />
        </Card>
      )
    },
    {
      label: 'Monthly Trend',
      content: (
        <Card>
          <div className="font-semibold mb-2">Monthly Trend</div>
          <ChartComponent type="line" data={monthlyTrendData} />
        </Card>
      )
    },
    {
      label: 'AI Insights',
      content: (
        <Card>
          <div className="font-semibold mb-1">AI Insights</div>
          <div className="text-gray-500 text-sm">
            <p>• Your spending on Food & Dining increased by 15% this month</p>
            <p>• Consider reducing entertainment expenses to meet your budget</p>
            <p>• Your savings rate is above average for your income level</p>
          </div>
        </Card>
      )
    }
  ];

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
            onClick={loadAnalyticsData}
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
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analytics', href: '/analytics' }
      ]} className="mb-4" />
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Analytics</h2>
        <div className="flex items-center space-x-4">
          <CurrencySelector />
          <Select value={filterChain} onChange={e => setFilterChain(e.target.value)}>
            <option value="ALL">All Chains</option>
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
            <option value="SOL">Solana</option>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Income
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {currency} {reportIncome?.toLocaleString() || 0}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Expense
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {currency} {reportExpense?.toLocaleString() || 0}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Net Savings
            </h3>
            <p className={`text-3xl font-bold ${(reportIncome - reportExpense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currency} {(reportIncome - reportExpense)?.toLocaleString() || 0}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Savings Rate
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {reportIncome > 0 ? ((reportIncome - reportExpense) / reportIncome * 100).toFixed(1) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs tabs={tabs} />
    </div>
  );
} 