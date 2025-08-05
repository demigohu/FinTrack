use crate::models::{Transaction, UserData};
use crate::utils;
use candid::CandidType;
use serde::{Deserialize, Serialize};

// Bitcoin canister types (simplified for compatibility)
#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct GetBalanceRequest {
    pub address: String,
    pub network: String,
    pub min_confirmations: Option<u32>,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct GetUtxosRequest {
    pub address: String,
    pub network: String,
    pub filter: Option<String>,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct GetUtxosResponse {
    pub utxos: Vec<Utxo>,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct Utxo {
    pub outpoint: OutPoint,
    pub value: u64,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub struct OutPoint {
    pub txid: Vec<u8>,
    pub vout: u32,
}

#[derive(Debug, Clone, CandidType, Serialize, Deserialize)]
pub enum Network {
    Mainnet,
    Regtest,
    Testnet,
}

impl Network {
    pub fn to_string(&self) -> String {
        match self {
            Network::Mainnet => "mainnet".to_string(),
            Network::Regtest => "regtest".to_string(),
            Network::Testnet => "testnet".to_string(),
        }
    }
}

pub async fn get_btc_balance(user_data: &UserData) -> Result<u64, String> {
    let address = user_data.wallet_addresses.get("BTC")
        .ok_or("BTC address not set for user")?;
    
    // Validate BTC address
    if !validate_btc_address(address) {
        return Err("Invalid BTC address format".to_string());
    }
    
    // Placeholder implementation - in production, use actual Bitcoin canister
    // For now, return a mock balance
    Ok(0) // Return 0 for now, implement with actual Bitcoin canister
}

pub async fn fetch_btc_transactions(user_data: &mut UserData) -> Result<GetUtxosResponse, String> {
    let address = user_data.wallet_addresses.get("BTC")
        .ok_or("BTC address not set for user")?;
    
    // Validate BTC address
    if !validate_btc_address(address) {
        return Err("Invalid BTC address format".to_string());
    }
    
    // Placeholder implementation - in production, use actual Bitcoin canister
    // For now, return empty response
    Ok(GetUtxosResponse { utxos: vec![] })
}

pub fn sync_utxos_to_transactions(user_data: &mut UserData, utxos_response: &GetUtxosResponse) -> Result<String, String> {
    let now = utils::get_current_time();
    let mut new_transactions = 0;
    
    for utxo in &utxos_response.utxos {
        let txid_hex = hex::encode(&utxo.outpoint.txid);
        let vout = utxo.outpoint.vout;
        let amount_btc = utxo.value as f64 / 100_000_000.0; // Convert satoshis to BTC
        
        // Check if transaction already exists
        let already_recorded = user_data.transactions.iter().any(|tx| {
            tx.description.contains(&txid_hex) && 
            tx.category == "Crypto-BTC" && 
            tx.amount == amount_btc
        });
        
        if !already_recorded {
            let desc = format!("BTC UTXO received (txid: {}, vout: {})", txid_hex, vout);
            let tx = Transaction {
                id: user_data.next_tx_id,
                amount: amount_btc,
                currency: "BTC".to_string(),
                description: desc,
                is_income: true,
                timestamp: now,
                date: utils::timestamp_to_date(now),
                category: "Crypto-BTC".to_string(),
                converted_amount: None,
                converted_currency: None,
                conversion_rate: None,
            };
            
            user_data.transactions.push(tx);
            user_data.balance_btc += amount_btc;
            user_data.next_tx_id += 1;
            new_transactions += 1;
        }
    }
    
    Ok(format!("Synced {} new BTC transactions", new_transactions))
}

pub fn validate_btc_address(address: &str) -> bool {
    // Basic validation for BTC address
    // In production, use proper BTC address validation library
    address.len() >= 26 && address.len() <= 35 && 
    (address.starts_with("1") || address.starts_with("3") || address.starts_with("bc1"))
}

pub fn calculate_btc_value_in_idr(btc_amount: f64, btc_to_idr_rate: f64) -> f64 {
    btc_amount * btc_to_idr_rate
}

pub fn calculate_btc_value_in_usd(btc_amount: f64, btc_to_usd_rate: f64) -> f64 {
    btc_amount * btc_to_usd_rate
}

// Additional Bitcoin utility functions
pub fn satoshis_to_btc(satoshis: u64) -> f64 {
    satoshis as f64 / 100_000_000.0
}

pub fn btc_to_satoshis(btc: f64) -> u64 {
    (btc * 100_000_000.0) as u64
}

pub fn format_btc_amount(amount: f64) -> String {
    format!("₿ {:.8}", amount)
}

pub fn get_network_string(network: Network) -> &'static str {
    match network {
        Network::Mainnet => "mainnet",
        Network::Regtest => "regtest",
        Network::Testnet => "testnet",
    }
} 