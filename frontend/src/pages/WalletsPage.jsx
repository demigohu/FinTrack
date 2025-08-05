import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { userService, bitcoinService } from '../services/backend';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Badge from '../components/Badge.jsx';

export default function WalletsPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [walletData, setWalletData] = useState({
    walletAddress: '',
    btcBalance: 0,
    btcTransactions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Load wallet data from backend
  const loadWalletData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load wallet address
      const addressResult = await userService.getWalletAddress('BTC');
      if (addressResult.success) {
        setWalletData(prev => ({
          ...prev,
          walletAddress: addressResult.data || ''
        }));
      }

      // Load BTC balance
      const balanceResult = await bitcoinService.getBtcBalance();
      if (balanceResult.success) {
        setWalletData(prev => ({
          ...prev,
          btcBalance: balanceResult.data || 0
        }));
      }

      // Load BTC transactions
      const txResult = await bitcoinService.fetchBtcTransactions();
      if (txResult.success) {
        setWalletData(prev => ({
          ...prev,
          btcTransactions: txResult.data || []
        }));
      }
    } catch (err) {
      setError('Failed to load wallet data');
      console.error('Error loading wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  // Handler connect/disconnect
  const connectBtc = async () => {
    setIsConnecting(true);
    try {
      // TODO: Implement wallet connection logic
      const testAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      const result = await userService.setWalletAddress('BTC', testAddress);
      if (result.success) {
        setWalletData(prev => ({
          ...prev,
          walletAddress: testAddress
        }));
        await loadWalletData(); // Refresh data
      }
    } catch (err) {
      alert('Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectBtc = async () => {
    try {
      const result = await userService.setWalletAddress('BTC', '');
      if (result.success) {
        setWalletData(prev => ({
          ...prev,
          walletAddress: '',
          btcBalance: 0,
          btcTransactions: []
        }));
      }
    } catch (err) {
      alert('Failed to disconnect wallet');
      console.error('Error disconnecting wallet:', err);
    }
  };

  const refreshBtcData = async () => {
    try {
      await loadWalletData();
    } catch (err) {
      alert('Failed to refresh data');
      console.error('Error refreshing data:', err);
    }
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
            onClick={loadWalletData}
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
      <h2 className="text-xl font-bold mb-4">Wallets</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* BTC Wallet */}
        <Card className="flex flex-col items-center">
          <div className="font-semibold mb-2">BTC (Bitcoin)</div>
          {!walletData.walletAddress ? (
            <Button 
              variant="secondary" 
              onClick={connectBtc}
              loading={isConnecting}
              className="mb-2"
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="text-center mb-2">
              <Badge color="green" size="sm" className="mb-2">
                Connected
              </Badge>
              <Button 
                variant="danger" 
                size="sm"
                onClick={disconnectBtc}
                className="mt-2"
              >
                Disconnect
              </Button>
            </div>
          )}
          <div className="text-gray-500 text-sm mb-1">
            Address: <span className="font-mono text-xs">{walletData.walletAddress || '-'}</span>
          </div>
          <div className="text-gray-500 text-sm mb-2">
            Balance: {walletData.btcBalance?.toFixed(8) || 0} BTC
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={refreshBtcData}
            disabled={!walletData.walletAddress}
          >
            Refresh
          </Button>
        </Card>

        {/* ETH Wallet */}
        <Card className="flex flex-col items-center">
          <div className="font-semibold mb-2">ETH (Ethereum)</div>
          <Button 
            variant="secondary" 
            disabled
            className="mb-2"
          >
            Coming Soon
          </Button>
          <div className="text-gray-500 text-sm mb-1">
            Address: <span className="font-mono text-xs">-</span>
          </div>
          <div className="text-gray-500 text-sm">
            Balance: 0 ETH
          </div>
        </Card>

        {/* SOL Wallet */}
        <Card className="flex flex-col items-center">
          <div className="font-semibold mb-2">SOL (Solana)</div>
          <Button 
            variant="secondary" 
            disabled
            className="mb-2"
          >
            Coming Soon
          </Button>
          <div className="text-gray-500 text-sm mb-1">
            Address: <span className="font-mono text-xs">-</span>
          </div>
          <div className="text-gray-500 text-sm">
            Balance: 0 SOL
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold">Recent Wallet Transactions</div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={refreshBtcData}
            disabled={!walletData.walletAddress}
          >
            Refresh
          </Button>
        </div>
        
        {walletData.btcTransactions && walletData.btcTransactions.length > 0 ? (
          <div className="space-y-2">
            {walletData.btcTransactions.map((tx, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{tx.description || 'Transaction'}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.timestamp / 1000000).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount?.toFixed(8) || 0} BTC
                  </div>
                  <Badge color={tx.amount > 0 ? 'green' : 'red'} size="sm">
                    {tx.amount > 0 ? 'Received' : 'Sent'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {walletData.walletAddress ? 'No transactions found' : 'Connect a wallet to view transactions'}
          </div>
        )}
      </Card>

      {/* Wallet Management */}
      <Card>
        <div className="font-semibold mb-4">Wallet Management</div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add Custom BTC Address
            </label>
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter BTC address"
                className="flex-1"
              />
              <Button variant="primary" size="sm">
                Add
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>• Supported wallets: UniSat, Xverse, OKX</p>
            <p>• Transactions are automatically synced</p>
            <p>• Real-time balance updates</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 