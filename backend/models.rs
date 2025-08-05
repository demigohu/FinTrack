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
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Budget {
    pub id: u64,
    pub category: String,
    pub budget: f64,
    pub spent: f64,
    pub currency: String,
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
    pub currency: String,
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
    pub balance_idr: f64,
    pub balance_usd: f64,
    pub balance_btc: f64,
    pub wallet_addresses: HashMap<String, String>,
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