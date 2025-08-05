use std::collections::HashMap;
use std::cell::RefCell;
use crate::utils;

thread_local! {
    static RATES: RefCell<HashMap<(String, String), f64>> = RefCell::new(HashMap::new());
}

pub fn set_rate(from: &str, to: &str, rate: f64) {
    RATES.with(|rates| {
        rates.borrow_mut().insert((from.to_string(), to.to_string()), rate);
    });
}

pub fn get_rate(from: &str, to: &str) -> Option<f64> {
    RATES.with(|rates| rates.borrow().get(&(from.to_string(), to.to_string())).cloned())
}

pub fn convert(amount: f64, from: &str, to: &str) -> Option<f64> {
    if from == to {
        Some(amount)
    } else {
        get_rate(from, to).map(|rate| amount * rate)
    }
}

pub fn initialize_default_rates() {
    // Set default rates
    set_rate("USD", "IDR", 15000.0);
    set_rate("IDR", "USD", 1.0 / 15000.0);
    set_rate("BTC", "USD", 45000.0);
    set_rate("USD", "BTC", 1.0 / 45000.0);
    set_rate("BTC", "IDR", 45000.0 * 15000.0);
    set_rate("IDR", "BTC", 1.0 / (45000.0 * 15000.0));
}

pub fn get_all_rates() -> HashMap<(String, String), f64> {
    RATES.with(|rates| rates.borrow().clone())
}

pub fn update_rate(from: &str, to: &str, new_rate: f64) -> Result<String, String> {
    if !utils::validate_currency(from) || !utils::validate_currency(to) {
        return Err("Invalid currency".to_string());
    }
    
    set_rate(from, to, new_rate);
    Ok(format!("Rate updated: 1 {} = {} {}", from, new_rate, to))
}

pub fn convert_with_fallback(amount: f64, from: &str, to: &str) -> f64 {
    convert(amount, from, to).unwrap_or(amount) // Fallback to original amount
}