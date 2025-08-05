use crate::models::UserData;

pub fn new_user() -> UserData {
    UserData::default()
}

pub fn get_user_summary(user_data: &UserData) -> (u64, u64, u64, u64) {
    let total_transactions = user_data.transactions.len() as u64;
    let total_budgets = user_data.budgets.len() as u64;
    let total_goals = user_data.goals.len() as u64;
    let unread_notifications = user_data.notifications.iter()
        .filter(|n| !n.is_read)
        .count() as u64;
    
    (total_transactions, total_budgets, total_goals, unread_notifications)
}

pub fn get_user_balance_summary(user_data: &UserData) -> (f64, f64, f64) {
    (user_data.balance_idr, user_data.balance_usd, user_data.balance_btc)
}

pub fn set_wallet_address(user_data: &mut UserData, chain: String, address: String) -> Result<String, String> {
    if chain.is_empty() || address.is_empty() {
        return Err("Chain and address cannot be empty".to_string());
    }
    
    user_data.wallet_addresses.insert(chain.clone(), address.clone());
    Ok(format!("Wallet address for {} updated successfully", chain))
}

pub fn get_wallet_address(user_data: &UserData, chain: &str) -> Option<String> {
    user_data.wallet_addresses.get(chain).cloned()
}

pub fn get_all_wallet_addresses(user_data: &UserData) -> Vec<(String, String)> {
    user_data.wallet_addresses.iter()
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

pub fn delete_wallet_address(user_data: &mut UserData, chain: &str) -> Result<String, String> {
    if user_data.wallet_addresses.remove(chain).is_some() {
        Ok(format!("Wallet address for {} deleted successfully", chain))
    } else {
        Err("Wallet address not found".to_string())
    }
}

pub fn validate_user_data(user_data: &UserData) -> Result<String, String> {
    // Check for negative balances
    if user_data.balance_idr < 0.0 {
        return Err("IDR balance cannot be negative".to_string());
    }
    if user_data.balance_usd < 0.0 {
        return Err("USD balance cannot be negative".to_string());
    }
    if user_data.balance_btc < 0.0 {
        return Err("BTC balance cannot be negative".to_string());
    }
    
    // Check for valid IDs
    if user_data.next_tx_id == 0 && !user_data.transactions.is_empty() {
        return Err("Invalid transaction ID sequence".to_string());
    }
    if user_data.next_budget_id == 0 && !user_data.budgets.is_empty() {
        return Err("Invalid budget ID sequence".to_string());
    }
    if user_data.next_goal_id == 0 && !user_data.goals.is_empty() {
        return Err("Invalid goal ID sequence".to_string());
    }
    if user_data.next_notification_id == 0 && !user_data.notifications.is_empty() {
        return Err("Invalid notification ID sequence".to_string());
    }
    
    Ok("User data is valid".to_string())
}

pub fn reset_user_data(user_data: &mut UserData) -> Result<String, String> {
    *user_data = UserData::default();
    Ok("User data reset successfully".to_string())
}