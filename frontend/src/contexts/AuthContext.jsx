import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendUtils, transactionService, userService, currencyService } from '../services/backend';

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
  const [currency, setCurrency] = useState('IDR');
  const [loading, setLoading] = useState(true);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const isAuth = await backendUtils.isAuthenticated();
        console.log('Initial auth check:', isAuth);
        setIsLoggedIn(isAuth);
        
        if (isAuth) {
          try {
            const currentUser = await backendUtils.getCurrentUser();
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
      await backendUtils.login();
      
      // Wait a bit for the login to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isAuth = await backendUtils.isAuthenticated();
      console.log('Login result - isAuthenticated:', isAuth);
      setIsLoggedIn(isAuth);
      
      if (isAuth) {
        try {
          const currentUser = await backendUtils.getCurrentUser();
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
      await backendUtils.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Currency conversion
  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    try {
      const result = await currencyService.convertCurrency(amount, fromCurrency, toCurrency);
      if (result.success) {
        return result.data;
      }
      return amount; // Fallback to original amount
    } catch (error) {
      console.error('Currency conversion error:', error);
      return amount; // Fallback to original amount
    }
  };

  // Get exchange rate
  const getExchangeRate = async (fromCurrency, toCurrency) => {
    try {
      const result = await currencyService.getCurrencyRate(fromCurrency, toCurrency);
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Get exchange rate error:', error);
      return null;
    }
  };

  // Format currency
  const formatCurrency = (amount, currencyCode) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'BTC' ? 8 : 2,
    });
    return formatter.format(amount);
  };

  // Get user balance
  const getUserBalance = async () => {
    try {
      const result = await userService.getUserBalanceSummary();
      if (result.success) {
        return result.data;
      }
      return { balance_idr: 0, balance_usd: 0, balance_btc: 0 };
    } catch (error) {
      console.error('Get user balance error:', error);
      return { balance_idr: 0, balance_usd: 0, balance_btc: 0 };
    }
  };

  // Get user summary
  const getUserSummary = async () => {
    try {
      const result = await userService.getUserSummary();
      if (result.success) {
        return result.data;
      }
      return { total_transactions: 0, total_budgets: 0, total_goals: 0, unread_notifications: 0 };
    } catch (error) {
      console.error('Get user summary error:', error);
      return { total_transactions: 0, total_budgets: 0, total_goals: 0, unread_notifications: 0 };
    }
  };

  // Get transactions
  const getTransactions = async () => {
    try {
      const result = await transactionService.getTransactions();
      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Get transactions error:', error);
      return [];
    }
  };

  // Get balance by currency
  const getBalance = async (currencyCode, yearMonth = null) => {
    try {
      const result = await transactionService.getBalance(currencyCode, yearMonth);
      if (result.success) {
        return result.data;
      }
      return 0;
    } catch (error) {
      console.error('Get balance error:', error);
      return 0;
    }
  };

  // Get total income
  const getTotalIncome = async (currencyCode, yearMonth = null) => {
    try {
      const result = await transactionService.getTotalIncome(currencyCode, yearMonth);
      if (result.success) {
        return result.data;
      }
      return 0;
    } catch (error) {
      console.error('Get total income error:', error);
      return 0;
    }
  };

  // Get total expense
  const getTotalExpense = async (currencyCode, yearMonth = null) => {
    try {
      const result = await transactionService.getTotalExpense(currencyCode, yearMonth);
      if (result.success) {
        return result.data;
      }
      return 0;
    } catch (error) {
      console.error('Get total expense error:', error);
      return 0;
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
    convertCurrency,
    getExchangeRate,
    formatCurrency,

    // Data
    getUserBalance,
    getUserSummary,
    getTransactions,
    getBalance,
    getTotalIncome,
    getTotalExpense,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 