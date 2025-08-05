use crate::models::{Budget, UserData};
use crate::utils;
use crate::service::transaction;

pub fn add_budget(user_data: &mut UserData, budget: Budget) -> Result<String, String> {
    // Validate currency
    if !utils::validate_currency(&budget.currency) {
        return Err("Invalid currency".to_string());
    }
    
    // Validate amount
    if budget.budget <= 0.0 {
        return Err("Budget amount must be positive".to_string());
    }
    
    // Check if budget for this category and period already exists
    if user_data.budgets.iter().any(|b| 
        b.category == budget.category && 
        b.period == budget.period && 
        b.currency == budget.currency
    ) {
        return Err("Budget for this category and period already exists".to_string());
    }
    
    user_data.budgets.push(budget);
    user_data.next_budget_id += 1;
    
    Ok("Budget added successfully".to_string())
}

pub fn get_budgets(user_data: &UserData) -> &Vec<Budget> {
    &user_data.budgets
}

pub fn get_budgets_by_period(user_data: &UserData, period: &str) -> Vec<Budget> {
    user_data.budgets.iter()
        .filter(|b| b.period == period)
        .cloned()
        .collect()
}

pub fn get_budgets_by_currency(user_data: &UserData, currency: &str) -> Vec<Budget> {
    user_data.budgets.iter()
        .filter(|b| b.currency == currency)
        .cloned()
        .collect()
}

pub fn update_budget(user_data: &mut UserData, budget_id: u64, updated_budget: Budget) -> Result<String, String> {
    if let Some(budget) = user_data.budgets.iter_mut().find(|b| b.id == budget_id) {
        *budget = updated_budget;
        budget.updated_at = utils::get_current_time();
        Ok("Budget updated successfully".to_string())
    } else {
        Err("Budget not found".to_string())
    }
}

pub fn delete_budget(user_data: &mut UserData, budget_id: u64) -> Result<String, String> {
    if let Some(index) = user_data.budgets.iter().position(|b| b.id == budget_id) {
        user_data.budgets.remove(index);
        Ok("Budget deleted successfully".to_string())
    } else {
        Err("Budget not found".to_string())
    }
}

pub fn update_budget_spent(user_data: &mut UserData) -> Result<String, String> {
    let budgets_to_update: Vec<(usize, f64)> = user_data.budgets.iter().enumerate()
        .map(|(index, budget)| {
            let spent = transaction::get_total_expense(
                user_data, 
                &budget.currency, 
                Some(&budget.period)
            );
            (index, spent)
        })
        .collect();
    
    for (index, spent) in budgets_to_update {
        user_data.budgets[index].spent = spent;
        user_data.budgets[index].updated_at = utils::get_current_time();
    }
    
    Ok("Budget spent amounts updated successfully".to_string())
}

pub fn get_budget_progress(user_data: &UserData, budget_id: u64) -> Option<(f64, f64, f64)> {
    user_data.budgets.iter()
        .find(|b| b.id == budget_id)
        .map(|b| (b.budget, b.spent, (b.spent / b.budget) * 100.0))
}

pub fn get_total_budget(user_data: &UserData, currency: &str, period: Option<&str>) -> f64 {
    user_data.budgets.iter()
        .filter(|b| {
            b.currency == currency &&
            period.map_or(true, |p| b.period == p)
        })
        .map(|b| b.budget)
        .sum()
}

pub fn get_total_spent(user_data: &UserData, currency: &str, period: Option<&str>) -> f64 {
    user_data.budgets.iter()
        .filter(|b| {
            b.currency == currency &&
            period.map_or(true, |p| b.period == p)
        })
        .map(|b| b.spent)
        .sum()
}