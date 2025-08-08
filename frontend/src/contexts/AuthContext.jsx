import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, balanceService, currencyService, transactionService } from '../services/backend';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const isAuth = await authService.isAuthenticated();
        console.log('Initial auth check:', isAuth);
        setIsLoggedIn(isAuth);
        
        if (isAuth) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (userError) {
            console.error('Error getting current user:', userError);
            // Don't logout on user fetch error, just continue
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a longer delay to ensure auth client is ready
    const timer = setTimeout(initializeAuth, 500);
    return () => clearTimeout(timer);
  }, []);

  // Login with Internet Identity
  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.login();
      
      // Wait a bit for the login to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isAuth = await authService.isAuthenticated();
      console.log('Login result - isAuthenticated:', isAuth);
      setIsLoggedIn(isAuth);
      
      if (isAuth) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (userError) {
          console.error('Error getting current user after login:', userError);
          // Still set as logged in even if user fetch fails
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get balance breakdown
  const getBalanceBreakdown = async () => {
    try {
      const breakdown = await balanceService.getBalanceBreakdown();
      return breakdown;
    } catch (error) {
      console.error('Get balance breakdown error:', error);
      return {
        usd_balance: 0,
        btc_balance: 0,
        eth_balance: 0,
        sol_balance: 0,
        btc_usd_value: 0,
        eth_usd_value: 0,
        sol_usd_value: 0,
        total_usd_value: 0,
        is_negative: false,
        negative_reason: null,
      };
    }
  };

  // Get portfolio summary
  const getPortfolioSummary = async () => {
    try {
      const summary = await balanceService.getPortfolioSummary();
      return summary;
    } catch (error) {
      console.error('Get portfolio summary error:', error);
      return {
        total_value_usd: 0,
        total_value_idr: 0,
        asset_allocation: {},
        balance_breakdown: {
          usd_balance: 0,
          btc_balance: 0,
          eth_balance: 0,
          sol_balance: 0,
          btc_usd_value: 0,
          eth_usd_value: 0,
          sol_usd_value: 0,
          total_usd_value: 0,
          is_negative: false,
          negative_reason: null,
        },
        diversification_score: 0,
      };
    }
  };

  // Get currency rates
  const getCurrencyRates = async () => {
    try {
      const rates = await currencyService.getCurrencyRates();
      return rates;
    } catch (error) {
      console.error('Get currency rates error:', error);
      return {
        usd_to_idr: 0,
        btc_to_usd: 0,
        eth_to_usd: 0,
        sol_to_usd: 0,
        last_updated: 0,
      };
    }
  };

  // Fetch real-time rates
  const fetchRealTimeRates = async () => {
    try {
      const rates = await currencyService.fetchRealTimeRates();
      return rates;
    } catch (error) {
      console.error('Fetch real-time rates error:', error);
      throw error;
    }
  };

  // Convert USD to display currency
  const convertToDisplayCurrency = (usdAmount, rates) => {
    if (currency === 'USD') return usdAmount;
    if (currency === 'IDR' && rates.usd_to_idr > 0) {
      return usdAmount * rates.usd_to_idr;
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

  // Format currency
  const formatCurrency = (amount, currencyCode) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'BTC' ? 8 : 2,
    });
    return formatter.format(amount);
  };

  // Get transactions
  const getTransactions = async () => {
    try {
      const transactions = await transactionService.getTransactions();
      return transactions;
    } catch (error) {
      console.error('Get transactions error:', error);
      return [];
    }
  };

  // Get transactions by source
  const getTransactionsBySource = async (source) => {
    try {
      const transactions = await transactionService.getTransactionsBySource(source);
      return transactions;
    } catch (error) {
      console.error('Get transactions by source error:', error);
      return [];
    }
  };

  // Get transactions by period
  const getTransactionsByPeriod = async (yearMonth) => {
    try {
      const transactions = await transactionService.getTransactionsByPeriod(yearMonth);
      return transactions;
    } catch (error) {
      console.error('Get transactions by period error:', error);
      return [];
    }
  };

  // Sync blockchain transactions
  const syncBlockchainTransactions = async () => {
    try {
      const result = await transactionService.syncBlockchainTransactions();
      return result;
    } catch (error) {
      console.error('Sync blockchain transactions error:', error);
      throw error;
    }
  };

  const value = {
    // Authentication
    isLoggedIn,
    user,
    loading,
    handleLogin,
    handleLogout,

    // Currency
    currency,
    setCurrency,
    getCurrencyRates,
    fetchRealTimeRates,
    convertToDisplayCurrency,
    getCurrencySymbol,
    formatCurrency,

    // Balance & Portfolio
    getBalanceBreakdown,
    getPortfolioSummary,

    // Transactions
    getTransactions,
    getTransactionsBySource,
    getTransactionsByPeriod,
    syncBlockchainTransactions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 