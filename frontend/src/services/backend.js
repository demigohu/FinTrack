// Backend Service Layer untuk komunikasi dengan IC Canister
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../src/declarations/backend';
import { canisterId } from '../../../src/declarations/backend/index.js';

// Network configuration
const network = process.env.DFX_NETWORK || 'local';
const identityProvider = network === 'ic' 
  ? 'https://identity.ic0.app' 
  : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY || 'vb2j2-fp777-77774-qaafq-cai'}.localhost:4943`;

let authClient = null;
let actor = null;

// Initialize authentication and actor
const initAuth = async () => {
  try {
    if (!authClient) {
      authClient = await AuthClient.create();
    }
    const identity = authClient.getIdentity();
    actor = createActor(canisterId, {
      agentOptions: { identity },
    });
    const isAuth = await authClient.isAuthenticated();
    console.log('initAuth - isAuthenticated:', isAuth);
    return isAuth;
  } catch (error) {
    console.error('Error in initAuth:', error);
    return false;
  }
};

// Check if authenticated with better error handling
const isAuthenticated = async () => {
  try {
    if (!authClient) {
      console.log('No authClient, creating new one');
      authClient = await AuthClient.create();
    }
    const isAuth = await authClient.isAuthenticated();
    console.log('isAuthenticated check:', isAuth);
    return isAuth;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Login with Internet Identity
const login = async () => {
  try {
    if (!authClient) {
      authClient = await AuthClient.create();
    }
    await authClient.login({
      identityProvider,
      onSuccess: async () => {
        console.log('Login successful, initializing auth...');
        await initAuth();
      },
      onError: (error) => {
        console.error('Login error:', error);
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    throw error;
  }
};

// Logout
const logout = async () => {
  if (authClient) {
    await authClient.logout();
    actor = null;
  }
};

// ===== TRANSACTION SERVICES =====

export const transactionService = {
  // Add manual transaction (USD only)
  async addManualTransaction(amount, description, transactionType, category, date) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.add_manual_transaction(
        Number(amount),
        description,
        transactionType, // 'income' or 'expense'
        category,
        date
      );
      
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error adding manual transaction:', error);
      throw error;
    }
  },

  // Get all transactions
  async getTransactions() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const transactions = await actor.get_transactions();
      return transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        timestamp: Number(tx.timestamp),
        converted_amount: tx.converted_amount ? Number(tx.converted_amount) : null,
        conversion_rate: tx.conversion_rate ? Number(tx.conversion_rate) : null,
        confirmations: tx.confirmations ? Number(tx.confirmations) : null,
        fee: tx.fee ? Number(tx.fee) : null,
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  // Get transactions by period
  async getTransactionsByPeriod(yearMonth) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const transactions = await actor.get_transactions_by_period(yearMonth);
      return transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        timestamp: Number(tx.timestamp),
        converted_amount: tx.converted_amount ? Number(tx.converted_amount) : null,
        conversion_rate: tx.conversion_rate ? Number(tx.conversion_rate) : null,
        confirmations: tx.confirmations ? Number(tx.confirmations) : null,
        fee: tx.fee ? Number(tx.fee) : null,
      }));
    } catch (error) {
      console.error('Error getting transactions by period:', error);
      throw error;
    }
  },

  // Get transactions by source
  async getTransactionsBySource(source) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const transactions = await actor.get_transactions_by_source(source);
      return transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        timestamp: Number(tx.timestamp),
        converted_amount: tx.converted_amount ? Number(tx.converted_amount) : null,
        conversion_rate: tx.conversion_rate ? Number(tx.conversion_rate) : null,
        confirmations: tx.confirmations ? Number(tx.confirmations) : null,
        fee: tx.fee ? Number(tx.fee) : null,
      }));
    } catch (error) {
      console.error('Error getting transactions by source:', error);
      throw error;
    }
  },

  // Sync blockchain transactions
  async syncBlockchainTransactions() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.sync_blockchain_transactions();
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error syncing blockchain transactions:', error);
      throw error;
    }
  },
};

// ===== BALANCE & PORTFOLIO SERVICES =====

export const balanceService = {
  // Get balance breakdown
  async getBalanceBreakdown() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const breakdown = await actor.get_balance_breakdown();
      return {
        usd_balance: Number(breakdown.usd_balance),
        btc_balance: Number(breakdown.btc_balance),
        eth_balance: Number(breakdown.eth_balance),
        sol_balance: Number(breakdown.sol_balance),
        btc_usd_value: Number(breakdown.btc_usd_value),
        eth_usd_value: Number(breakdown.eth_usd_value),
        sol_usd_value: Number(breakdown.sol_usd_value),
        total_usd_value: Number(breakdown.total_usd_value),
        is_negative: breakdown.is_negative,
        negative_reason: breakdown.negative_reason,
      };
    } catch (error) {
      console.error('Error getting balance breakdown:', error);
      throw error;
    }
  },

  // Get portfolio summary
  async getPortfolioSummary() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const summary = await actor.get_portfolio_summary();
      return {
        total_value_usd: Number(summary.total_value_usd),
        total_value_idr: Number(summary.total_value_idr),
        asset_allocation: summary.asset_allocation,
        balance_breakdown: {
          usd_balance: Number(summary.balance_breakdown.usd_balance),
          btc_balance: Number(summary.balance_breakdown.btc_balance),
          eth_balance: Number(summary.balance_breakdown.eth_balance),
          sol_balance: Number(summary.balance_breakdown.sol_balance),
          btc_usd_value: Number(summary.balance_breakdown.btc_usd_value),
          eth_usd_value: Number(summary.balance_breakdown.eth_usd_value),
          sol_usd_value: Number(summary.balance_breakdown.sol_usd_value),
          total_usd_value: Number(summary.balance_breakdown.total_usd_value),
          is_negative: summary.balance_breakdown.is_negative,
          negative_reason: summary.balance_breakdown.negative_reason,
        },
        diversification_score: Number(summary.diversification_score),
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      throw error;
    }
  },

  // Get total balance in USD
  async getTotalBalanceUsd() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const balance = await actor.get_total_balance_usd();
      return Number(balance);
    } catch (error) {
      console.error('Error getting total balance USD:', error);
      throw error;
    }
  },

  // Get crypto balances
  async getCryptoBalances() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const balances = await actor.get_crypto_balances();
      return {
        btc: Number(balances[0]),
        eth: Number(balances[1]),
        sol: Number(balances[2]),
      };
    } catch (error) {
      console.error('Error getting crypto balances:', error);
      throw error;
    }
  },
};

// ===== CURRENCY SERVICES =====

export const currencyService = {
  // Fetch real-time rates
  async fetchRealTimeRates() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const rates = await actor.fetch_real_time_rates();
      if ('Ok' in rates) {
        return {
          usd_to_idr: Number(rates.Ok.usd_to_idr),
          btc_to_usd: Number(rates.Ok.btc_to_usd),
          eth_to_usd: Number(rates.Ok.eth_to_usd),
          sol_to_usd: Number(rates.Ok.sol_to_usd),
          last_updated: Number(rates.Ok.last_updated),
        };
      } else {
        throw new Error(rates.Err);
      }
    } catch (error) {
      console.error('Error fetching real-time rates:', error);
      throw error;
    }
  },

  // Get currency rates
  async getCurrencyRates() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const rates = await actor.get_currency_rates();
      return {
        usd_to_idr: Number(rates.usd_to_idr),
        btc_to_usd: Number(rates.btc_to_usd),
        eth_to_usd: Number(rates.eth_to_usd),
        sol_to_usd: Number(rates.sol_to_usd),
        last_updated: Number(rates.last_updated),
      };
    } catch (error) {
      console.error('Error getting currency rates:', error);
      throw error;
    }
  },

  // Update currency rates
  async updateCurrencyRates(usdToIdr, btcToUsd, ethToUsd, solToUsd) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.update_currency_rates(
        Number(usdToIdr),
        Number(btcToUsd),
        Number(ethToUsd),
        Number(solToUsd)
      );
      
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error updating currency rates:', error);
      throw error;
    }
  },

  // Get all rates
  async getAllRates() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const rates = await actor.get_all_rates();
      return rates.map(rate => ({
        from: rate[0],
        to: rate[1],
        rate: Number(rate[2]),
      }));
    } catch (error) {
      console.error('Error getting all rates:', error);
      throw error;
    }
  },
};

// ===== BUDGET SERVICES =====

export const budgetService = {
  // Add budget
  async addBudget(category, budget, currency, period) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.add_budget(category, Number(budget), currency, period);
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  },

  // Get budgets
  async getBudgets(period = null) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const budgets = await actor.get_budgets(period ? [period] : []);
      return budgets.map(budget => ({
        ...budget,
        budget: Number(budget.budget),
        spent: Number(budget.spent),
        created_at: Number(budget.created_at),
        updated_at: Number(budget.updated_at),
      }));
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  },

  // Update budget spent
  async updateBudgetSpent() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.update_budget_spent();
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error updating budget spent:', error);
      throw error;
    }
  },
};

// ===== GOAL SERVICES =====

export const goalService = {
  // Add goal
  async addGoal(title, description, targetAmount, currentAmount, currency, deadline, category, priority) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.add_goal(
        title,
        description,
        Number(targetAmount),
        Number(currentAmount),
        currency,
        deadline,
        category,
        priority
      );
      
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  // Get goals
  async getGoals() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const goals = await actor.get_goals();
      return goals.map(goal => ({
        ...goal,
        target_amount: Number(goal.target_amount),
        current_amount: Number(goal.current_amount),
        created_at: Number(goal.created_at),
        updated_at: Number(goal.updated_at),
      }));
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  },
};

// ===== NOTIFICATION SERVICES =====

export const notificationService = {
  // Get notifications
  async getNotifications(category = null, showRead = false) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const notifications = await actor.get_notifications(
        category ? [category] : [],
        showRead
      );
      
      return notifications.map(notification => ({
        ...notification,
        timestamp: Number(notification.timestamp),
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const count = await actor.get_unread_notification_count();
      return Number(count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.mark_notification_read(Number(notificationId));
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};

// ===== WALLET SERVICES =====

export const walletService = {
  // Set wallet address
  async setWalletAddress(chain, address) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.set_wallet_address(chain, address);
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error setting wallet address:', error);
      throw error;
    }
  },

  // Get wallet address
  async getWalletAddress(chain) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const address = await actor.get_wallet_address(chain);
      return address.length > 0 ? address[0] : null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw error;
    }
  },

  // Get BTC balance
  async getBtcBalance() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.get_btc_balance();
      if ('Ok' in result) {
        return Number(result.Ok);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error getting BTC balance:', error);
      throw error;
    }
  },

  // Validate BTC address
  async validateBtcAddress(address) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      return await actor.validate_btc_address(address);
    } catch (error) {
      console.error('Error validating BTC address:', error);
      throw error;
    }
  },

  // Format BTC amount
  async formatBtcAmount(amount) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      return await actor.format_btc_amount(Number(amount));
    } catch (error) {
      console.error('Error formatting BTC amount:', error);
      throw error;
    }
  },

  // Convert satoshis to BTC
  async satoshisToBtc(satoshis) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.satoshis_to_btc(Number(satoshis));
      return Number(result);
    } catch (error) {
      console.error('Error converting satoshis to BTC:', error);
      throw error;
    }
  },

  // Convert BTC to satoshis
  async btcToSatoshis(btc) {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) throw new Error('Not authenticated. Please login first.');
      }
      
      const result = await actor.btc_to_satoshis(Number(btc));
      return Number(result);
    } catch (error) {
      console.error('Error converting BTC to satoshis:', error);
      throw error;
    }
  },
};

// ===== AUTHENTICATION SERVICES =====

export const authService = {
  async init() {
    return await initAuth();
  },

  async login() {
    return await login();
  },

  async logout() {
    return await logout();
  },

  async isAuthenticated() {
    return await isAuthenticated();
  },

  async getCurrentUser() {
    try {
      if (!authClient) {
        return null;
      }
      const identity = authClient.getIdentity();
      return identity ? identity.getPrincipal().toText() : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  getEnvironmentInfo() {
    return {
      network,
      identityProvider,
      canisterId,
    };
  },

  async getBackendStatus() {
    try {
      if (!actor) {
        const isAuth = await initAuth();
        if (!isAuth) return { status: 'not_authenticated' };
      }
      
      // Try to call a simple query to test connection
      await actor.get_transactions();
      return { status: 'connected' };
    } catch (error) {
      console.error('Backend status check failed:', error);
      return { status: 'error', error: error.message };
    }
  },
}; 