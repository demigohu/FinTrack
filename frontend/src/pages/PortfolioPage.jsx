import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { balanceService, currencyService } from '../services/backend';
import ChartComponent from '../components/ChartComponent.jsx';
import Card from '../components/Card.jsx';
import Progress from '../components/Progress.jsx';

export default function PortfolioPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [balanceBreakdown, setBalanceBreakdown] = useState({});
  const [portfolioSummary, setPortfolioSummary] = useState({});
  const [currencyRates, setCurrencyRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load portfolio data from backend
  const loadPortfolioData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load balance breakdown
      const breakdown = await balanceService.getBalanceBreakdown();
      setBalanceBreakdown(breakdown);

      // Load portfolio summary
      const portfolio = await balanceService.getPortfolioSummary();
      setPortfolioSummary(portfolio);

      // Load currency rates
      const rates = await currencyService.getCurrencyRates();
      setCurrencyRates(rates);
    } catch (err) {
      setError('Failed to load portfolio data: ' + err.message);
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

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

  // Hitung alokasi aset
  const allocation = useMemo(() => {
    const usd = Number(balanceBreakdown.usd_balance || 0);
    const btc = Number(balanceBreakdown.btc_usd_value || 0);
    const eth = Number(balanceBreakdown.eth_usd_value || 0);
    const sol = Number(balanceBreakdown.sol_usd_value || 0);
    const total = usd + btc + eth + sol;
    
    return [
      { label: 'USD', value: usd, percent: total ? (usd / total) * 100 : 0, color: '#10B981' },
      { label: 'BTC', value: btc, percent: total ? (btc / total) * 100 : 0, color: '#F7931A' },
      { label: 'ETH', value: eth, percent: total ? (eth / total) * 100 : 0, color: '#627EEA' },
      { label: 'SOL', value: sol, percent: total ? (sol / total) * 100 : 0, color: '#9945FF' },
    ];
  }, [balanceBreakdown]);

  // Data untuk pie chart alokasi aset
  const pieChartData = {
    labels: allocation.map(a => a.label),
    datasets: [{
      data: allocation.map(a => a.value),
      backgroundColor: allocation.map(a => a.color),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Data untuk line chart historical (dummy data, ganti dengan data asli)
  const historicalData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Portfolio Value',
      data: [10000, 12000, 11000, 15000, 14000, 16000],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
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
            onClick={loadPortfolioData}
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-4">Portfolio</h2>
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
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Portfolio Value
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {getCurrencySymbol()}{convertToDisplayCurrency(Number(portfolioSummary.total_value_usd || 0)).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Diversification Score: {Number(portfolioSummary.diversification_score || 0).toFixed(1)}%
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              USD Balance
            </h3>
            <p className="text-3xl font-bold text-green-600">
              ${Number(balanceBreakdown.usd_balance || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {getCurrencySymbol()}{convertToDisplayCurrency(Number(balanceBreakdown.usd_balance || 0)).toLocaleString()}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              BTC Balance
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              ₿{Number(balanceBreakdown.btc_balance || 0).toFixed(8)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ${Number(balanceBreakdown.btc_usd_value || 0).toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Crypto Value
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              ${Number(balanceBreakdown.btc_usd_value || 0) + Number(balanceBreakdown.eth_usd_value || 0) + Number(balanceBreakdown.sol_usd_value || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              BTC + ETH + SOL
            </p>
          </div>
        </Card>
      </div>

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

      {/* Crypto Balances Detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ETH Balance
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              Ξ{Number(balanceBreakdown.eth_balance || 0).toFixed(6)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ${Number(balanceBreakdown.eth_usd_value || 0).toFixed(2)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              SOL Balance
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              ◎{Number(balanceBreakdown.sol_balance || 0).toFixed(6)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ${Number(balanceBreakdown.sol_usd_value || 0).toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Crypto
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              ${Number(balanceBreakdown.btc_usd_value || 0) + Number(balanceBreakdown.eth_usd_value || 0) + Number(balanceBreakdown.sol_usd_value || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              All Cryptocurrencies
            </p>
          </div>
        </Card>
      </div>

      {/* Pie chart alokasi aset */}
      <Card>
        <div className="font-semibold mb-2">Asset Allocation</div>
        <ChartComponent type="pie" data={pieChartData} />
      </Card>
      
      {/* Progress bars untuk alokasi */}
      <Card>
        <div className="font-semibold mb-4">Asset Allocation Progress</div>
        <div className="space-y-3">
          {allocation.map((asset, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span>{asset.label}</span>
                <span>{Number(asset.percent || 0).toFixed(1)}%</span>
              </div>
              <Progress 
                value={asset.percent} 
                max={100} 
                color={asset.label === 'USD' ? 'green' : asset.label === 'BTC' ? 'orange' : asset.label === 'ETH' ? 'blue' : 'purple'}
                size="sm"
              />
            </div>
          ))}
        </div>
      </Card>
      
      {/* Historical chart */}
      <Card>
        <div className="font-semibold mb-2">Portfolio Value Over Time</div>
        <ChartComponent type="line" data={historicalData} />
      </Card>
      
      {/* Risk analysis */}
      <Card>
        <div className="font-semibold mb-2">Portfolio Analysis</div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Diversification Score:</span>
            <span className="text-sm font-medium">{Number(portfolioSummary.diversification_score || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Value (USD):</span>
            <span className="text-sm font-medium">${Number(portfolioSummary.total_value_usd || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Value (IDR):</span>
            <span className="text-sm font-medium">Rp{Number(portfolioSummary.total_value_idr || 0).toLocaleString()}</span>
          </div>
          <div className="text-gray-500 text-sm mt-2">
            {Number(portfolioSummary.diversification_score || 0) > 50 
              ? "Your portfolio is well diversified." 
              : "Consider diversifying your portfolio more."}
          </div>
        </div>
      </Card>
    </div>
  );
} 