use crate::models::{Transaction, UserData};
use crate::utils;

pub fn add_transaction(user_data: &mut UserData, tx: Transaction) -> Result<String, String> {
    // Validate currency
    if !utils::validate_currency(&tx.currency) {
        return Err("Invalid currency".to_string());
    }
    
    // Validate amount
    if tx.amount <= 0.0 {
        return Err("Amount must be positive".to_string());
    }
    
    // Add transaction
    user_data.transactions.push(tx.clone());
    user_data.next_tx_id += 1;
    
    // Update balance
    update_balance(user_data, &tx);
    
    Ok("Transaction added successfully".to_string())
}

pub fn get_transactions(user_data: &UserData) -> &Vec<Transaction> {
    &user_data.transactions
}

pub fn get_transactions_by_period(user_data: &UserData, year_month: &str) -> Vec<Transaction> {
    user_data.transactions.iter()
        .filter(|tx| utils::get_year_month(tx.timestamp) == year_month)
        .cloned()
        .collect()
}

pub fn get_transactions_by_type(user_data: &UserData, is_income: bool) -> Vec<Transaction> {
    user_data.transactions.iter()
        .filter(|tx| tx.is_income == is_income)
        .cloned()
        .collect()
}

pub fn get_transactions_by_category(user_data: &UserData, category: &str) -> Vec<Transaction> {
    user_data.transactions.iter()
        .filter(|tx| tx.category == category)
        .cloned()
        .collect()
}

pub fn get_transactions_by_currency(user_data: &UserData, currency: &str) -> Vec<Transaction> {
    user_data.transactions.iter()
        .filter(|tx| tx.currency == currency)
        .cloned()
        .collect()
}

pub fn delete_transaction(user_data: &mut UserData, tx_id: u64) -> Result<String, String> {
    if let Some(index) = user_data.transactions.iter().position(|tx| tx.id == tx_id) {
        let tx = user_data.transactions.remove(index);
        // Reverse balance update
        reverse_balance_update(user_data, &tx);
        Ok("Transaction deleted successfully".to_string())
    } else {
        Err("Transaction not found".to_string())
    }
}

pub fn update_transaction(user_data: &mut UserData, tx_id: u64, updated_tx: Transaction) -> Result<String, String> {
    if let Some(index) = user_data.transactions.iter().position(|tx| tx.id == tx_id) {
        let old_tx = user_data.transactions[index].clone();
        
        // Reverse old balance
        reverse_balance_update(user_data, &old_tx);
        
        // Update transaction
        user_data.transactions[index] = updated_tx.clone();
        
        // Update new balance
        update_balance(user_data, &updated_tx);
        
        Ok("Transaction updated successfully".to_string())
    } else {
        Err("Transaction not found".to_string())
    }
}

pub fn get_total_income(user_data: &UserData, currency: &str, year_month: Option<&str>) -> f64 {
    user_data.transactions.iter()
        .filter(|tx| {
            tx.is_income && 
            tx.currency == currency &&
            year_month.map_or(true, |ym| utils::get_year_month(tx.timestamp) == ym)
        })
        .map(|tx| tx.amount)
        .sum()
}

pub fn get_total_expense(user_data: &UserData, currency: &str, year_month: Option<&str>) -> f64 {
    user_data.transactions.iter()
        .filter(|tx| {
            !tx.is_income && 
            tx.currency == currency &&
            year_month.map_or(true, |ym| utils::get_year_month(tx.timestamp) == ym)
        })
        .map(|tx| tx.amount)
        .sum()
}

pub fn get_balance(user_data: &UserData, currency: &str, year_month: Option<&str>) -> f64 {
    let income = get_total_income(user_data, currency, year_month);
    let expense = get_total_expense(user_data, currency, year_month);
    income - expense
}

fn update_balance(user_data: &mut UserData, tx: &Transaction) {
    let amount = if tx.is_income { tx.amount } else { -tx.amount };
    
    match tx.currency.as_str() {
        "IDR" => user_data.balance_idr += amount,
        "USD" => user_data.balance_usd += amount,
        "BTC" => user_data.balance_btc += amount,
        _ => {} // Handle other currencies if needed
    }
}

fn reverse_balance_update(user_data: &mut UserData, tx: &Transaction) {
    let amount = if tx.is_income { -tx.amount } else { tx.amount };
    
    match tx.currency.as_str() {
        "IDR" => user_data.balance_idr += amount,
        "USD" => user_data.balance_usd += amount,
        "BTC" => user_data.balance_btc += amount,
        _ => {} // Handle other currencies if needed
    }
}