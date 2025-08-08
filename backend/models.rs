use candid::CandidType;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::borrow::Cow;
use ic_stable_structures::storable::Storable;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub id: u64,
    pub amount: f64,
    pub currency: String,
    pub description: String,
    pub is_income: bool,
    pub timestamp: u64,
    pub date: String,
    pub category: String,
    pub converted_amount: Option<f64>,
    pub converted_currency: Option<String>,
    pub conversion_rate: Option<f64>,
    // UPDATED FIELDS for simplified system
    pub transaction_type: Option<String>,  // 'income', 'expense', 'received', 'sent' (removed 'investment')
    pub source: Option<String>,           // 'manual' or 'blockchain'
    pub txid: Option<String>,            // Blockchain transaction ID
    pub confirmations: Option<u32>,      // Number of confirmations
    pub fee: Option<f64>,               // Transaction fee
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Budget {
    pub id: u64,
    pub category: String,
    pub budget: f64,
    pub spent: f64,
    pub currency: String, // Always USD for manual budgets
    pub period: String,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Goal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub target_amount: f64,
    pub current_amount: f64,
    pub currency: String, // Always USD for goals
    pub deadline: String,
    pub category: String,
    pub priority: String,
    pub status: String,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Notification {
    pub id: u64,
    pub title: String,
    pub message: String,
    pub type_: String,
    pub category: String,
    pub timestamp: u64,
    pub is_read: bool,
}

// NEW: Balance Breakdown Structure
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct BalanceBreakdown {
    pub usd_balance: f64,
    pub btc_balance: f64,
    pub eth_balance: f64,
    pub sol_balance: f64,
    pub btc_usd_value: f64,
    pub eth_usd_value: f64,
    pub sol_usd_value: f64,
    pub total_usd_value: f64,
    pub is_negative: bool,
    pub negative_reason: Option<String>, // Explanation if balance is negative
}

// NEW: Currency Rate Structure
#[derive(CandidType, Serialize, Deserialize, Clone, Default)]
pub struct CurrencyRate {
    pub usd_to_idr: f64,
    pub btc_to_usd: f64,
    pub eth_to_usd: f64,
    pub sol_to_usd: f64,
    pub last_updated: u64,
}

// NEW: Portfolio Summary Structure
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct PortfolioSummary {
    pub total_value_usd: f64,
    pub total_value_idr: f64,
    pub asset_allocation: HashMap<String, f64>, // Currency -> Percentage
    pub balance_breakdown: BalanceBreakdown,
    pub diversification_score: f64, // 0-100
}



#[derive(CandidType, Serialize, Deserialize, Clone, Default)]
pub struct UserData {
    pub transactions: Vec<Transaction>,
    pub budgets: Vec<Budget>,
    pub goals: Vec<Goal>,
    pub notifications: Vec<Notification>,
    pub next_tx_id: u64,
    pub next_budget_id: u64,
    pub next_goal_id: u64,
    pub next_notification_id: u64,
    // UPDATED: Simplified balance structure
    pub balance_usd: f64,
    pub balance_btc: f64,
    pub balance_eth: f64,
    pub balance_sol: f64,
    pub wallet_addresses: HashMap<String, String>,
    // NEW: Currency rates only (no display currency)
    pub currency_rates: CurrencyRate,
}

impl Storable for UserData {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

// NEW: Helper functions for balance calculations
impl UserData {
    pub fn get_balance_breakdown(&self) -> BalanceBreakdown {
        // Check if rates are loaded (not all 0.0)
        let rates_loaded = self.currency_rates.usd_to_idr > 0.0 
            && self.currency_rates.btc_to_usd > 0.0 
            && self.currency_rates.eth_to_usd > 0.0 
            && self.currency_rates.sol_to_usd > 0.0;
        
        let btc_usd_value = if rates_loaded {
            self.balance_btc * self.currency_rates.btc_to_usd
        } else {
            0.0 // Cannot calculate without rates
        };
        
        let eth_usd_value = if rates_loaded {
            self.balance_eth * self.currency_rates.eth_to_usd
        } else {
            0.0 // Cannot calculate without rates
        };
        
        let sol_usd_value = if rates_loaded {
            self.balance_sol * self.currency_rates.sol_to_usd
        } else {
            0.0 // Cannot calculate without rates
        };
        
        let total_usd_value = self.balance_usd + btc_usd_value + eth_usd_value + sol_usd_value;
        let is_negative = total_usd_value < 0.0;
        
        let negative_reason = if is_negative {
            Some(format!(
                "Total balance is negative: USD ${:.2}, BTC ${:.2}, ETH ${:.2}, SOL ${:.2}",
                self.balance_usd, btc_usd_value, eth_usd_value, sol_usd_value
            ))
        } else {
            None
        };

        BalanceBreakdown {
            usd_balance: self.balance_usd,
            btc_balance: self.balance_btc,
            eth_balance: self.balance_eth,
            sol_balance: self.balance_sol,
            btc_usd_value,
            eth_usd_value,
            sol_usd_value,
            total_usd_value,
            is_negative,
            negative_reason,
        }
    }

    pub fn get_portfolio_summary(&self) -> PortfolioSummary {
        let breakdown = self.get_balance_breakdown();
        let total_value = breakdown.total_usd_value;
        
        let mut asset_allocation = HashMap::new();
        if total_value > 0.0 {
            asset_allocation.insert("USD".to_string(), (breakdown.usd_balance / total_value) * 100.0);
            asset_allocation.insert("BTC".to_string(), (breakdown.btc_usd_value / total_value) * 100.0);
            asset_allocation.insert("ETH".to_string(), (breakdown.eth_usd_value / total_value) * 100.0);
            asset_allocation.insert("SOL".to_string(), (breakdown.sol_usd_value / total_value) * 100.0);
        }

        // Calculate diversification score (0-100)
        let diversification_score = if asset_allocation.len() > 1 {
            let max_allocation = asset_allocation.values().fold(0.0, |max, &val| val.max(max));
            (100.0 - max_allocation).max(0.0) // Higher score = more diversified
        } else {
            0.0
        };

        // Check if rates are loaded for IDR conversion
        let total_value_idr = if self.currency_rates.usd_to_idr > 0.0 {
            total_value * self.currency_rates.usd_to_idr
        } else {
            0.0 // Cannot convert without rates
        };

        PortfolioSummary {
            total_value_usd: total_value,
            total_value_idr,
            asset_allocation,
            balance_breakdown: breakdown,
            diversification_score,
        }
    }
}