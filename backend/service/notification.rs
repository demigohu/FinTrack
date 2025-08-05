use crate::models::{Notification, UserData};
use crate::utils;

pub fn add_notification(user_data: &mut UserData, notification: Notification) -> Result<String, String> {
    // Validate notification type
    if !["success", "warning", "danger", "info"].contains(&notification.type_.as_str()) {
        return Err("Invalid notification type".to_string());
    }
    
    // Validate category
    if !["budget", "goal", "transaction", "market", "payment", "ai"].contains(&notification.category.as_str()) {
        return Err("Invalid notification category".to_string());
    }
    
    let mut new_notification = notification;
    new_notification.timestamp = utils::get_current_time();
    new_notification.is_read = false;
    
    user_data.notifications.push(new_notification);
    user_data.next_notification_id += 1;
    
    Ok("Notification added successfully".to_string())
}

pub fn get_notifications(user_data: &UserData) -> &Vec<Notification> {
    &user_data.notifications
}

pub fn get_notifications_by_category(user_data: &UserData, category: &str) -> Vec<Notification> {
    user_data.notifications.iter()
        .filter(|n| n.category == category)
        .cloned()
        .collect()
}

pub fn get_notifications_by_type(user_data: &UserData, type_: &str) -> Vec<Notification> {
    user_data.notifications.iter()
        .filter(|n| n.type_ == type_)
        .cloned()
        .collect()
}

pub fn get_unread_notifications(user_data: &UserData) -> Vec<Notification> {
    user_data.notifications.iter()
        .filter(|n| !n.is_read)
        .cloned()
        .collect()
}

pub fn mark_notification_read(user_data: &mut UserData, notification_id: u64) -> Result<String, String> {
    if let Some(notification) = user_data.notifications.iter_mut().find(|n| n.id == notification_id) {
        notification.is_read = true;
        Ok("Notification marked as read".to_string())
    } else {
        Err("Notification not found".to_string())
    }
}

pub fn mark_all_notifications_read(user_data: &mut UserData) -> Result<String, String> {
    for notification in &mut user_data.notifications {
        notification.is_read = true;
    }
    Ok("All notifications marked as read".to_string())
}

pub fn delete_notification(user_data: &mut UserData, notification_id: u64) -> Result<String, String> {
    if let Some(index) = user_data.notifications.iter().position(|n| n.id == notification_id) {
        user_data.notifications.remove(index);
        Ok("Notification deleted successfully".to_string())
    } else {
        Err("Notification not found".to_string())
    }
}

pub fn get_unread_count(user_data: &UserData) -> u64 {
    user_data.notifications.iter()
        .filter(|n| !n.is_read)
        .count() as u64
}

pub fn get_notification_count_by_category(user_data: &UserData, category: &str) -> u64 {
    user_data.notifications.iter()
        .filter(|n| n.category == category)
        .count() as u64
}

pub fn get_notification_count_by_type(user_data: &UserData, type_: &str) -> u64 {
    user_data.notifications.iter()
        .filter(|n| n.type_ == type_)
        .count() as u64
}

pub fn create_budget_alert(user_data: &mut UserData, _budget_id: u64, category: &str, spent_percentage: f64) -> Result<String, String> {
    let message = format!("Budget {} telah mencapai {:.1}%", category, spent_percentage);
    let notification = Notification {
        id: user_data.next_notification_id,
        title: "Budget Alert".to_string(),
        message,
        type_: "warning".to_string(),
        category: "budget".to_string(),
        timestamp: utils::get_current_time(),
        is_read: false,
    };
    
    add_notification(user_data, notification)
}

pub fn create_goal_completed_alert(user_data: &mut UserData, goal_title: &str) -> Result<String, String> {
    let message = format!("Selamat! Goal '{}' telah selesai!", goal_title);
    let notification = Notification {
        id: user_data.next_notification_id,
        title: "Goal Achieved!".to_string(),
        message,
        type_: "success".to_string(),
        category: "goal".to_string(),
        timestamp: utils::get_current_time(),
        is_read: false,
    };
    
    add_notification(user_data, notification)
}