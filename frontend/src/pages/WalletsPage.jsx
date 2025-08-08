import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { walletService } from '../services/backend';
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
  const [customAddress, setCustomAddress] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);

  // Load wallet data from backend
  const loadWalletData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load wallet address
      const addressResult = await walletService.getWalletAddress('BTC');
      if (addressResult) {
        setWalletData(prev => ({
          ...prev,
          walletAddress: addressResult || ''
        }));
      }

      // Only try to load BTC balance if wallet address is set
      if (addressResult && addressResult.trim() !== '') {
        try {
          const balanceResult = await walletService.getBtcBalance();
          console.log('Balance result:', balanceResult);
          
          if (balanceResult !== null && balanceResult !== undefined) {
            // Extract satoshis from Ok variant
            let satoshis;
            if (balanceResult && typeof balanceResult === 'object' && 'Ok' in balanceResult) {
              satoshis = Number(balanceResult.Ok);
            } else {
              satoshis = Number(balanceResult);
            }
            console.log('Satoshis:', satoshis);
            
            if (!isNaN(satoshis) && satoshis > 0) {
              try {
                const btcResult = await walletService.satoshisToBtc(satoshis);
                console.log('BTC result:', btcResult);
                
                if (btcResult) {
                  setWalletData(prev => ({
                    ...prev,
                    btcBalance: btcResult || 0
                  }));
                } else {
                  // Fallback: convert manually if API fails
                  const btcBalance = satoshis / 100_000_000;
                  console.log('Fallback BTC balance:', btcBalance);
                  setWalletData(prev => ({
                    ...prev,
                    btcBalance: btcBalance
                  }));
                }
              } catch (error) {
                console.error('Error in BTC conversion:', error);
                // Fallback: convert manually
                const btcBalance = satoshis / 100_000_000;
                setWalletData(prev => ({
                  ...prev,
                  btcBalance: btcBalance
                }));
              }
            } else {
              // No balance or invalid data
              console.log('Invalid satoshis:', satoshis);
              setWalletData(prev => ({
                ...prev,
                btcBalance: 0
              }));
            }
          } else {
            // No balance data
            console.log('No balance data:', balanceResult);
            setWalletData(prev => ({
              ...prev,
              btcBalance: 0
            }));
          }
        } catch (balanceError) {
          console.log('BTC balance not available (address not set):', balanceError.message);
          setWalletData(prev => ({
            ...prev,
            btcBalance: 0
          }));
        }

        // Load BTC transactions only if wallet is connected
        try {
          const txResult = await walletService.getBtcTransactions();
          if (txResult) {
            setWalletData(prev => ({
              ...prev,
              btcTransactions: txResult || []
            }));
          }
        } catch (txError) {
          console.log('BTC transactions not available:', txError.message);
          setWalletData(prev => ({
            ...prev,
            btcTransactions: []
          }));
        }
      } else {
        // No wallet address set
        setWalletData(prev => ({
          ...prev,
          btcBalance: 0,
          btcTransactions: []
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
    if (!customAddress.trim()) {
      alert('Please enter a valid BTC address');
      return;
    }
    
    setIsConnecting(true);
    try {
      const result = await walletService.setWalletAddress('BTC', customAddress.trim());
      if (result) {
        setWalletData(prev => ({
          ...prev,
          walletAddress: customAddress.trim()
        }));
        setCustomAddress('');
        setShowAddressInput(false);
        await loadWalletData(); // Refresh data
        alert('Wallet connected successfully!');
      } else {
        alert('Failed to connect wallet: ' + result.error);
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
      const result = await walletService.setWalletAddress('BTC', '');
      if (result) {
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
            <div className="text-center mb-2">
              {!showAddressInput ? (
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAddressInput(true)}
                  className="mb-2"
                >
                  Connect Wallet
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input 
                    placeholder="Enter BTC address"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      variant="primary" 
                      onClick={connectBtc}
                      loading={isConnecting}
                      size="sm"
                    >
                      Connect
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setShowAddressInput(false);
                        setCustomAddress('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
            Balance: {Number(walletData.btcBalance || 0).toFixed(8)} BTC
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
                    {tx.date ? new Date(tx.date).toLocaleDateString() : new Date(Number(tx.timestamp) / 1000000).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                                  <div className={`font-medium text-sm ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount || 0).toFixed(8)} BTC
                </div>
                  <Badge color={Number(tx.amount) > 0 ? 'green' : 'red'} size="sm">
                    {Number(tx.amount) > 0 ? 'Received' : 'Sent'}
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
          <div className="text-sm text-gray-500">
            <p>• <strong>Bitcoin Regtest:</strong> Use addresses from your local Bitcoin regtest</p>
            <p>• <strong>Real-time sync:</strong> Transactions are automatically synced from blockchain</p>
            <p>• <strong>Balance tracking:</strong> Real-time balance updates from Bitcoin API</p>
            <p>• <strong>Transaction history:</strong> View all incoming and outgoing transactions</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How to Test:</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>1. Start Bitcoin regtest: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">bitcoind -regtest -daemon</code></p>
              <p>2. Generate address: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">bitcoin-cli -regtest getnewaddress</code></p>
              <p>3. Send test BTC: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">bitcoin-cli -regtest sendtoaddress "address" 0.001</code></p>
              <p>4. Connect wallet in FinTrack with the address</p>
              <p>5. Click "Refresh" to sync blockchain data</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 