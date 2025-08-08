mod models;
mod utils;
pub mod service;

use models::*;
use ic_cdk::api::caller;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse, TransformArgs,
    TransformContext,
};
use std::cell::RefCell;
use ic_stable_structures::{memory_manager::{MemoryId, MemoryManager, VirtualMemory}, DefaultMemoryImpl, StableBTreeMap};
use candid::Principal;

// Stable memory setup
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    static USERS: RefCell<StableBTreeMap<Principal, UserData, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new({
        let memory = MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)));
        StableBTreeMap::init(memory)
    });
}

#[ic_cdk::init]
fn init() {
    // No more default rates initialization
    // Rates will be fetched from CoinGecko when needed
}

// Helper function to initialize default user data
fn get_or_initialize_user_data(user: Principal) -> UserData {
    USERS.with(|users| {
        let users = users.borrow();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        // Initialize empty currency rates for new users
        if user_data.currency_rates.usd_to_idr == 0.0 {
            user_data.currency_rates = service::currency::get_empty_currency_rates();
        }
        
        user_data
    })
}

// ===== TRANSACTION METHODS =====

#[ic_cdk::update]
fn add_transaction(
    amount: f64,
    description: String,
    is_income: bool,
    category: String,
    date: String,
) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        let tx = Transaction {
            id: user_data.next_tx_id,
            amount,
            currency: "USD".to_string(), // Always USD for manual transactions
            description,
            is_income,
            timestamp: utils::get_current_time(),
            date,
            category,
            converted_amount: None,
            converted_currency: None,
            conversion_rate: None,
            // UPDATED: Simplified transaction types
            transaction_type: Some(if is_income { "income".to_string() } else { "expense".to_string() }),
            source: Some("manual".to_string()),
            txid: None,
            confirmations: None,
            fee: None,
        };
        
        let result = service::transaction::add_transaction(&mut user_data, tx);
        if result.is_ok() {
            users.insert(user, user_data);
        }
        result
    })
}

#[ic_cdk::update]
fn add_manual_transaction(
    amount: f64,
    description: String,
    transaction_type: String,  // 'income', 'expense' only (removed 'investment')
    category: String,
    date: String,
) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    // Enhanced validation
    if amount <= 0.0 {
        return Err("Amount must be greater than 0".to_string());
    }
    
    if description.trim().is_empty() {
        return Err("Description cannot be empty".to_string());
    }
    
    if transaction_type != "income" && transaction_type != "expense" {
        return Err("Transaction type must be 'income' or 'expense'".to_string());
    }
    
    if category.trim().is_empty() {
        return Err("Category cannot be empty".to_string());
    }
    
    if date.trim().is_empty() {
        return Err("Date cannot be empty".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        let tx = Transaction {
            id: user_data.next_tx_id,
            amount,
            currency: "USD".to_string(), // Always USD for manual transactions
            description,
            is_income: transaction_type == "income",
            timestamp: utils::get_current_time(),
            date,
            category,
            converted_amount: None,
            converted_currency: None,
            conversion_rate: None,
            transaction_type: Some(transaction_type),
            source: Some("manual".to_string()),
            txid: None,
            confirmations: None,
            fee: None,
        };
        
        let result = service::transaction::add_transaction(&mut user_data, tx);
        if result.is_ok() {
            users.insert(user, user_data);
        }
        result
    })
}

#[ic_cdk::query]
fn get_transactions() -> Vec<Transaction> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::transaction::get_transactions(&user_data).clone()
    })
}

#[ic_cdk::query]
fn get_transactions_by_period(year_month: String) -> Vec<Transaction> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::transaction::get_transactions_by_period(&user_data, &year_month)
    })
}

#[ic_cdk::query]
fn get_balance(currency: String, year_month: Option<String>) -> f64 {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::transaction::get_balance(&user_data, &currency, year_month.as_deref())
    })
}

#[ic_cdk::query]
fn get_total_income(currency: String, year_month: Option<String>) -> f64 {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::transaction::get_total_income(&user_data, &currency, year_month.as_deref())
    })
}

#[ic_cdk::query]
fn get_total_expense(currency: String, year_month: Option<String>) -> f64 {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::transaction::get_total_expense(&user_data, &currency, year_month.as_deref())
    })
}

// ===== BUDGET METHODS =====

#[ic_cdk::update]
fn add_budget(
    category: String,
    budget: f64,
    currency: String,
    period: String,
) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        let budget_obj = Budget {
            id: user_data.next_budget_id,
            category,
            budget,
            spent: 0.0,
            currency,
            period,
            created_at: utils::get_current_time(),
            updated_at: utils::get_current_time(),
        };
        
        let result = service::budget::add_budget(&mut user_data, budget_obj);
        if result.is_ok() {
            users.insert(user, user_data);
        }
        result
    })
}

#[ic_cdk::query]
fn get_budgets(period: Option<String>) -> Vec<Budget> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        match period {
            Some(p) => service::budget::get_budgets_by_period(&user_data, &p),
            None => service::budget::get_budgets(&user_data).clone(),
        }
    })
}

#[ic_cdk::update]
fn update_budget_spent() -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        let result = service::budget::update_budget_spent(&mut user_data);
        if result.is_ok() {
            users.insert(user, user_data);
        }
        result
    })
}

// ===== GOAL METHODS =====

#[ic_cdk::update]
fn add_goal(
    title: String,
    description: String,
    target_amount: f64,
    current_amount: f64,
    currency: String,
    deadline: String,
    category: String,
    priority: String,
) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        let goal = Goal {
            id: user_data.next_goal_id,
            title,
            description,
            target_amount,
            current_amount,
            currency,
            deadline,
            category,
            priority,
            status: "active".to_string(),
            created_at: utils::get_current_time(),
            updated_at: utils::get_current_time(),
        };
        
        let result = service::goal::add_goal(&mut user_data, goal);
        if result.is_ok() {
            users.insert(user, user_data);
        }
        result
    })
}

#[ic_cdk::query]
fn get_goals() -> Vec<Goal> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::goal::get_goals(&user_data).clone()
    })
}

// ===== NOTIFICATION METHODS =====

#[ic_cdk::query]
fn get_notifications(category: Option<String>, show_read: bool) -> Vec<Notification> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        match category {
            Some(cat) => service::notification::get_notifications_by_category(&user_data, &cat),
            None => {
                if show_read {
                    service::notification::get_notifications(&user_data).clone()
                } else {
                    service::notification::get_unread_notifications(&user_data)
                }
            }
        }
    })
}

#[ic_cdk::query]
fn get_unread_notification_count() -> u64 {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::notification::get_unread_count(&user_data)
    })
}

#[ic_cdk::update]
fn mark_notification_read(notification_id: u64) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        let result = service::notification::mark_notification_read(&mut user_data, notification_id);
        if result.is_ok() {
            users.insert(user, user_data);
        }
        result
    })
}

// ===== CURRENCY METHODS =====

#[ic_cdk::query]
fn get_currency_rate(from: String, to: String) -> Option<f64> {
    service::currency::get_rate(&from, &to)
}

#[ic_cdk::update]
fn set_currency_rate(from: String, to: String, rate: f64) -> Result<String, String> {
    service::currency::update_rate(&from, &to, rate)
}

#[ic_cdk::query]
fn convert_currency(amount: f64, from: String, to: String) -> Option<f64> {
    service::currency::convert(amount, &from, &to)
}

#[ic_cdk::query]
fn get_all_rates() -> Vec<(String, String, f64)> {
    service::currency::get_all_rates()
        .into_iter()
        .map(|((from, to), rate)| (from, to, rate))
        .collect()
}

#[ic_cdk::query]
fn get_transactions_by_source(source: String) -> Vec<Transaction> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        user_data.transactions.iter()
            .filter(|tx| tx.source.as_ref().map_or(false, |s| s == &source))
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn get_transactions_by_currency(currency: String) -> Vec<Transaction> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        user_data.transactions.iter()
            .filter(|tx| tx.currency == currency)
            .cloned()
            .collect()
    })
}

// ===== USER METHODS =====

#[ic_cdk::query]
fn get_user_summary() -> (u64, u64, u64, u64) {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::user::get_user_summary(&user_data)
    })
}

#[ic_cdk::query]
fn get_user_balance_summary() -> (f64, f64, f64) {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::user::get_user_balance_summary(&user_data)
    })
}

#[ic_cdk::update]
fn set_wallet_address(chain: String, address: String) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        let result = service::user::set_wallet_address(&mut user_data, chain, address);
        if result.is_ok() {
            users.insert(user, user_data);
        }
        result
    })
}

#[ic_cdk::query]
fn get_wallet_address(chain: String) -> Option<String> {
    let user = caller();
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default();
        service::user::get_wallet_address(&user_data, &chain)
    })
}

// ===== BITCOIN METHODS =====

#[ic_cdk::update]
async fn get_btc_balance() -> Result<u64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    let user_data = USERS.with(|users| {
        let users = users.borrow();
        users.get(&user).unwrap_or_default().clone()
    });
    
    service::bitcoin::get_btc_balance(&user_data).await
}

#[ic_cdk::update]
async fn fetch_btc_transactions() -> Result<service::bitcoin::GetUtxosResponse, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    let mut user_data = USERS.with(|users| {
        let users = users.borrow();
        users.get(&user).unwrap_or_default().clone()
    });
    
    let result = service::bitcoin::fetch_btc_transactions(&mut user_data).await;
    
    if result.is_ok() {
        USERS.with(|users| {
            let mut users = users.borrow_mut();
            users.insert(user, user_data);
        });
    }
    
    result
}

#[ic_cdk::query]
fn validate_btc_address(address: String) -> bool {
    service::bitcoin::validate_btc_address(&address)
}

#[ic_cdk::query]
fn format_btc_amount(amount: f64) -> String {
    service::bitcoin::format_btc_amount(amount)
}

#[ic_cdk::query]
fn satoshis_to_btc(satoshis: u64) -> f64 {
    service::bitcoin::satoshis_to_btc(satoshis)
}

#[ic_cdk::query]
fn btc_to_satoshis(btc: f64) -> u64 {
    service::bitcoin::btc_to_satoshis(btc)
}



#[ic_cdk::update]
async fn sync_blockchain_transactions() -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    let mut user_data = USERS.with(|users| {
        let users = users.borrow();
        users.get(&user).unwrap_or_default().clone()
    });
    
    let result = service::bitcoin::sync_blockchain_transactions(&mut user_data).await;
    
    if result.is_ok() {
        USERS.with(|users| {
            let mut users = users.borrow_mut();
            users.insert(user, user_data);
        });
    }
    
    result
}

// ===== NEW BALANCE & PORTFOLIO METHODS =====

#[ic_cdk::query]
fn get_balance_breakdown() -> BalanceBreakdown {
    let user = caller();
    let user_data = get_or_initialize_user_data(user);
    user_data.get_balance_breakdown()
}

#[ic_cdk::query]
fn get_portfolio_summary() -> PortfolioSummary {
    let user = caller();
    let user_data = get_or_initialize_user_data(user);
    user_data.get_portfolio_summary()
}

#[ic_cdk::query]
fn get_currency_rates() -> CurrencyRate {
    let user = caller();
    let user_data = get_or_initialize_user_data(user);
    user_data.currency_rates.clone()
}

#[ic_cdk::update]
fn update_currency_rates(
    usd_to_idr: f64,
    btc_to_usd: f64,
    eth_to_usd: f64,
    sol_to_usd: f64,
) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        user_data.currency_rates = CurrencyRate {
            usd_to_idr,
            btc_to_usd,
            eth_to_usd,
            sol_to_usd,
            last_updated: utils::get_current_time(),
        };
        
        users.insert(user, user_data);
        Ok("Currency rates updated successfully".to_string())
    })
}

// ===== UPDATED BALANCE METHODS =====

#[ic_cdk::query]
fn get_total_balance_usd() -> f64 {
    let user = caller();
    let user_data = get_or_initialize_user_data(user);
    let breakdown = user_data.get_balance_breakdown();
    breakdown.total_usd_value
}

#[ic_cdk::query]
fn get_crypto_balances() -> (f64, f64, f64) {
    let user = caller();
    let user_data = get_or_initialize_user_data(user);
    (user_data.balance_btc, user_data.balance_eth, user_data.balance_sol)
}

// ===== REAL-TIME RATES =====

#[ic_cdk::update]
async fn fetch_real_time_rates() -> Result<CurrencyRate, String> {
    service::currency::fetch_real_time_rates().await
}

#[ic_cdk::query]
fn transform(raw: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: raw.response.status,
        headers: raw.response.headers,
        body: raw.response.body,
    }
}

ic_cdk::export_candid!();