import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  transactionService, 
  budgetService, 
  goalService, 
  notificationService,
  bitcoinService 
} from '../services/backend';

// Hook untuk transactions
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await transactionService.getTransactions();
      if (result.success) {
        setTransactions(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const addTransaction = useCallback(async (transactionData) => {
    if (!isLoggedIn) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await transactionService.addTransaction(
        transactionData.amount,
        transactionData.currency,
        transactionData.description,
        transactionData.isIncome,
        transactionData.category
      );
      
      if (result.success) {
        await fetchTransactions(); // Refresh data
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const error = 'Failed to add transaction';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction
  };
};

// Hook untuk budgets
export const useBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  const fetchBudgets = useCallback(async (period = null) => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetService.getBudgets(period);
      if (result.success) {
        setBudgets(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const addBudget = useCallback(async (budgetData) => {
    if (!isLoggedIn) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetService.addBudget(
        budgetData.category,
        budgetData.budget,
        budgetData.currency,
        budgetData.period
      );
      
      if (result.success) {
        await fetchBudgets(); // Refresh data
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const error = 'Failed to add budget';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, fetchBudgets]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    addBudget
  };
};

// Hook untuk goals
export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  const fetchGoals = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await goalService.getGoals();
      if (result.success) {
        setGoals(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const addGoal = useCallback(async (goalData) => {
    if (!isLoggedIn) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await goalService.addGoal(
        goalData.title,
        goalData.description,
        goalData.targetAmount,
        goalData.currentAmount,
        goalData.currency,
        goalData.deadline,
        goalData.category,
        goalData.priority
      );
      
      if (result.success) {
        await fetchGoals(); // Refresh data
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const error = 'Failed to add goal';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, fetchGoals]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal
  };
};

// Hook untuk notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  const fetchNotifications = useCallback(async (category = null, showRead = false) => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await notificationService.getNotifications(category, showRead);
      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [isLoggedIn]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!isLoggedIn) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        await fetchNotifications(); // Refresh data
        await fetchUnreadCount(); // Refresh unread count
      }
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to mark as read' };
    }
  }, [isLoggedIn, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead
  };
};

// Hook untuk Bitcoin
export const useBitcoin = () => {
  const [btcBalance, setBtcBalance] = useState(0);
  const [btcTransactions, setBtcTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  const fetchBtcBalance = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bitcoinService.getBtcBalance();
      if (result.success) {
        setBtcBalance(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch BTC balance');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchBtcTransactions = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bitcoinService.fetchBtcTransactions();
      if (result.success) {
        setBtcTransactions(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch BTC transactions');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const validateBtcAddress = useCallback(async (address) => {
    try {
      const result = await bitcoinService.validateBtcAddress(address);
      return result.success ? result.data : false;
    } catch (err) {
      return false;
    }
  }, []);

  useEffect(() => {
    fetchBtcBalance();
  }, [fetchBtcBalance]);

  return {
    btcBalance,
    btcTransactions,
    loading,
    error,
    fetchBtcBalance,
    fetchBtcTransactions,
    validateBtcAddress
  };
}; 