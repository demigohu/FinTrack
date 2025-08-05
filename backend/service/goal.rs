use crate::models::{Goal, UserData};
use crate::utils;

pub fn add_goal(user_data: &mut UserData, goal: Goal) -> Result<String, String> {
    // Validate currency
    if !utils::validate_currency(&goal.currency) {
        return Err("Invalid currency".to_string());
    }
    
    // Validate amount
    if goal.target_amount <= 0.0 {
        return Err("Target amount must be positive".to_string());
    }
    
    // Validate priority
    if !utils::validate_priority(&goal.priority) {
        return Err("Invalid priority".to_string());
    }
    
    // Validate current amount
    if goal.current_amount < 0.0 {
        return Err("Current amount cannot be negative".to_string());
    }
    
    // Check if current amount exceeds target
    let status = if goal.current_amount >= goal.target_amount { 
        "completed".to_string() 
    } else { 
        "active".to_string() 
    };
    
    let mut new_goal = goal;
    new_goal.status = status;
    new_goal.created_at = utils::get_current_time();
    new_goal.updated_at = utils::get_current_time();
    
    user_data.goals.push(new_goal);
    user_data.next_goal_id += 1;
    
    Ok("Goal added successfully".to_string())
}

pub fn get_goals(user_data: &UserData) -> &Vec<Goal> {
    &user_data.goals
}

pub fn get_goals_by_status(user_data: &UserData, status: &str) -> Vec<Goal> {
    user_data.goals.iter()
        .filter(|g| g.status == status)
        .cloned()
        .collect()
}

pub fn get_goals_by_priority(user_data: &UserData, priority: &str) -> Vec<Goal> {
    user_data.goals.iter()
        .filter(|g| g.priority == priority)
        .cloned()
        .collect()
}

pub fn get_goals_by_currency(user_data: &UserData, currency: &str) -> Vec<Goal> {
    user_data.goals.iter()
        .filter(|g| g.currency == currency)
        .cloned()
        .collect()
}

pub fn update_goal(user_data: &mut UserData, goal_id: u64, updated_goal: Goal) -> Result<String, String> {
    if let Some(goal) = user_data.goals.iter_mut().find(|g| g.id == goal_id) {
        // Validate currency
        if !utils::validate_currency(&updated_goal.currency) {
            return Err("Invalid currency".to_string());
        }
        
        // Validate priority
        if !utils::validate_priority(&updated_goal.priority) {
            return Err("Invalid priority".to_string());
        }
        
        // Update status based on current vs target amount
        let status = if updated_goal.current_amount >= updated_goal.target_amount { 
            "completed".to_string() 
        } else { 
            "active".to_string() 
        };
        
        *goal = updated_goal;
        goal.status = status;
        goal.updated_at = utils::get_current_time();
        
        Ok("Goal updated successfully".to_string())
    } else {
        Err("Goal not found".to_string())
    }
}

pub fn delete_goal(user_data: &mut UserData, goal_id: u64) -> Result<String, String> {
    if let Some(index) = user_data.goals.iter().position(|g| g.id == goal_id) {
        user_data.goals.remove(index);
        Ok("Goal deleted successfully".to_string())
    } else {
        Err("Goal not found".to_string())
    }
}

pub fn update_goal_progress(user_data: &mut UserData, goal_id: u64, new_amount: f64) -> Result<String, String> {
    if let Some(goal) = user_data.goals.iter_mut().find(|g| g.id == goal_id) {
        goal.current_amount = new_amount;
        
        // Update status
        goal.status = if new_amount >= goal.target_amount { 
            "completed".to_string() 
        } else { 
            "active".to_string() 
        };
        
        goal.updated_at = utils::get_current_time();
        
        Ok("Goal progress updated successfully".to_string())
    } else {
        Err("Goal not found".to_string())
    }
}

pub fn get_goal_progress(user_data: &UserData, goal_id: u64) -> Option<(f64, f64, f64)> {
    user_data.goals.iter()
        .find(|g| g.id == goal_id)
        .map(|g| (g.target_amount, g.current_amount, (g.current_amount / g.target_amount) * 100.0))
}

pub fn get_total_target_amount(user_data: &UserData, currency: &str, status: Option<&str>) -> f64 {
    user_data.goals.iter()
        .filter(|g| {
            g.currency == currency &&
            status.map_or(true, |s| g.status == s)
        })
        .map(|g| g.target_amount)
        .sum()
}

pub fn get_total_current_amount(user_data: &UserData, currency: &str, status: Option<&str>) -> f64 {
    user_data.goals.iter()
        .filter(|g| {
            g.currency == currency &&
            status.map_or(true, |s| g.status == s)
        })
        .map(|g| g.current_amount)
        .sum()
}