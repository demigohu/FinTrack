import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { userService, bitcoinService, currencyService } from '../services/backend';
import ChartComponent from '../components/ChartComponent.jsx';
import Card from '../components/Card.jsx';
import Progress from '../components/Progress.jsx';

export default function PortfolioPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [portfolioData, setPortfolioData] = useState({
    balance_idr: 0,
    balance_usd: 0,
    balance_btc: 0,
    btcToIdr: 0,
    usdToIdr: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load portfolio data from backend
  const loadPortfolioData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load user balance summary
      const balanceResult = await userService.getUserBalanceSummary();
      if (balanceResult.success) {
        setPortfolioData(prev => ({
          ...prev,
          ...balanceResult.data
        }));
      }

      // Load BTC balance
      const btcResult = await bitcoinService.getBtcBalance();
      if (btcResult.success && btcResult.data !== null && btcResult.data !== undefined) {
        // Extract satoshis from Ok variant
        let satoshis;
        if (btcResult.data && typeof btcResult.data === 'object' && 'Ok' in btcResult.data) {
          satoshis = Number(btcResult.data.Ok);
        } else {
          satoshis = Number(btcResult.data);
        }
        
        if (!isNaN(satoshis) && satoshis > 0) {
          try {
            const btcBalanceResult = await bitcoinService.satoshisToBtc(satoshis);
            if (btcBalanceResult.success) {
              setPortfolioData(prev => ({
                ...prev,
                balance_btc: btcBalanceResult.data || 0
              }));
            } else {
              // Fallback: convert manually if API fails
              const btcBalance = satoshis / 100_000_000;
              setPortfolioData(prev => ({
                ...prev,
                balance_btc: btcBalance
              }));
            }
          } catch (error) {
            console.error('Error converting BTC balance for portfolio:', error);
            // Fallback: convert manually
            const btcBalance = satoshis / 100_000_000;
            setPortfolioData(prev => ({
              ...prev,
              balance_btc: btcBalance
            }));
          }
        } else {
          setPortfolioData(prev => ({
            ...prev,
            balance_btc: 0
          }));
        }
      } else {
        setPortfolioData(prev => ({
          ...prev,
          balance_btc: 0
        }));
      }

      // Load exchange rates
      const ratesResult = await currencyService.getAllRates();
      if (ratesResult.success) {
        const rates = ratesResult.data;
        setPortfolioData(prev => ({
          ...prev,
          btcToIdr: rates.BTC?.IDR || 0,
          usdToIdr: rates.USD?.IDR || 0
        }));
      }
    } catch (err) {
      setError('Failed to load portfolio data');
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Hitung alokasi aset
  const allocation = useMemo(() => {
    const idr = Number(portfolioData.balance_idr || 0);
    const usd = Number(portfolioData.balance_usd || 0) * Number(portfolioData.usdToIdr || 1);
    const btc = Number(portfolioData.balance_btc || 0) * Number(portfolioData.btcToIdr || 1);
    const total = idr + usd + btc;
    return [
      { label: 'IDR', value: idr, percent: total ? (idr / total) * 100 : 0 },
      { label: 'USD', value: usd, percent: total ? (usd / total) * 100 : 0 },
      { label: 'BTC', value: btc, percent: total ? (btc / total) * 100 : 0 },
    ];
  }, [portfolioData]);

  // Data untuk pie chart alokasi aset
  const pieChartData = {
    labels: allocation.map(a => a.label),
    datasets: [{
      data: allocation.map(a => a.value),
      backgroundColor: [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
      ],
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
      <h2 className="text-xl font-bold mb-4">Portfolio</h2>
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Portfolio Value
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              IDR {(Number(portfolioData.balance_idr || 0) + 
                (Number(portfolioData.balance_usd || 0) * Number(portfolioData.usdToIdr || 1)) + 
                (Number(portfolioData.balance_btc || 0) * Number(portfolioData.btcToIdr || 1))).toLocaleString()}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              IDR Balance
            </h3>
            <p className="text-3xl font-bold text-green-600">
              IDR {Number(portfolioData.balance_idr || 0).toLocaleString()}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              BTC Balance
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {Number(portfolioData.balance_btc || 0).toFixed(8)} BTC
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
                color={idx === 0 ? 'blue' : idx === 1 ? 'green' : 'yellow'}
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
        <div className="font-semibold mb-2">Risk Analysis</div>
        <div className="text-gray-500 text-sm">Your portfolio is well diversified.</div>
      </Card>
    </div>
  );
} 