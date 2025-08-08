use std::collections::HashMap;
use std::cell::RefCell;
use crate::utils;
use crate::models::CurrencyRate;
use candid::CandidType;
use serde::{Deserialize, Serialize};
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse, TransformContext,
};
use crate::transform;

thread_local! {
    static RATES: RefCell<HashMap<(String, String), f64>> = RefCell::new(HashMap::new());
}

// NEW: HTTP outcall for real-time rates
pub async fn fetch_real_time_rates() -> Result<CurrencyRate, String> {
    let user = ic_cdk::api::caller();
    if user == candid::Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    // Fetch USD/IDR rate
    let usd_to_idr = get_usd_to_idr_rate().await?;
    
    // Fetch crypto rates
    let btc_to_usd = get_crypto_usd_rate("bitcoin").await?;
    let eth_to_usd = get_crypto_usd_rate("ethereum").await?;
    let sol_to_usd = get_crypto_usd_rate("solana").await?;

    let rates = CurrencyRate {
        usd_to_idr,
        btc_to_usd,
        eth_to_usd,
        sol_to_usd,
        last_updated: utils::get_current_time(),
    };

    // Update local rates
    set_rate("USD", "IDR", rates.usd_to_idr);
    set_rate("IDR", "USD", 1.0 / rates.usd_to_idr);
    set_rate("BTC", "USD", rates.btc_to_usd);
    set_rate("USD", "BTC", 1.0 / rates.btc_to_usd);
    set_rate("ETH", "USD", rates.eth_to_usd);
    set_rate("USD", "ETH", 1.0 / rates.eth_to_usd);
    set_rate("SOL", "USD", rates.sol_to_usd);
    set_rate("USD", "SOL", 1.0 / rates.sol_to_usd);

    Ok(rates)
}

async fn get_usd_to_idr_rate() -> Result<f64, String> {
    let url = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd,idr&symbols=usdt".to_string();
    let request_headers = vec![
        HttpHeader {
            name: "Accept".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "X-Cg-Demo-Api-Key".to_string(),
            value: "CG-R6KYDr2MxXQ3Y34TNTWyhuhn".to_string(),
        },
    ];
    let request = CanisterHttpRequestArgument {
        url,
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2000),
        transform: Some(TransformContext::from_name("transform".to_string(), vec![])),
        headers: request_headers,
    };
    match ic_cdk::api::management_canister::http_request::http_request(request, 100_000_000).await {
        Ok((response,)) => {
            let str_body = String::from_utf8(response.body)
                .map_err(|_| "Failed to decode response body".to_string())?;
            let json: serde_json::Value = serde_json::from_str(&str_body)
                .map_err(|_| "Failed to parse JSON".to_string())?;
            ic_cdk::println!("USD/IDR Response: {}", str_body);
            let usd_to_idr = json["usdt"]["idr"].as_f64()
                .ok_or("No idr in response".to_string())?;
            Ok(usd_to_idr)
        }
        Err((code, msg)) => Err(format!("HTTP request failed. Code: {:?}, Msg: {}", code, msg)),
    }
}

async fn get_crypto_usd_rate(crypto_id: &str) -> Result<f64, String> {
    // Map crypto_id to symbol
    let symbol = match crypto_id {
        "bitcoin" => "btc",
        "ethereum" => "eth", 
        "solana" => "sol",
        _ => crypto_id,
    };
    
    let url = format!("https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&symbols={}", symbol);
    let request_headers = vec![
        HttpHeader {
            name: "Accept".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "X-Cg-Demo-Api-Key".to_string(),
            value: "CG-R6KYDr2MxXQ3Y34TNTWyhuhn".to_string(),
        },
    ];
    let request = CanisterHttpRequestArgument {
        url,
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2000),
        transform: Some(TransformContext::from_name("transform".to_string(), vec![])),
        headers: request_headers,
    };
    match ic_cdk::api::management_canister::http_request::http_request(request, 100_000_000).await {
        Ok((response,)) => {
            let str_body = String::from_utf8(response.body)
                .map_err(|_| "Failed to decode response body".to_string())?;
            let json: serde_json::Value = serde_json::from_str(&str_body)
                .map_err(|_| "Failed to parse JSON".to_string())?;
            ic_cdk::println!("{} Response: {}", crypto_id, str_body);
            // Parse response based on symbol
            let rate = json[symbol]["usd"].as_f64()
                .ok_or(format!("No usd rate for {}", symbol))?;
            Ok(rate)
        }
        Err((code, msg)) => Err(format!("HTTP request failed. Code: {:?}, Msg: {}", code, msg)),
    }
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

// REMOVED: initialize_default_rates() - no more default rates
// Rates will be fetched from CoinGecko when needed

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

// NEW: Get empty currency rates structure (will be populated by API)
pub fn get_empty_currency_rates() -> CurrencyRate {
    CurrencyRate {
        usd_to_idr: 0.0,
        btc_to_usd: 0.0,
        eth_to_usd: 0.0,
        sol_to_usd: 0.0,
        last_updated: utils::get_current_time(),
    }
}

// NEW: Check if rates are loaded
pub fn has_rates() -> bool {
    RATES.with(|rates| !rates.borrow().is_empty())
}

// NEW: Get rates if available, otherwise return error
pub fn get_currency_rates() -> Result<CurrencyRate, String> {
    if !has_rates() {
        return Err("Currency rates not loaded. Please fetch real-time rates first.".to_string());
    }
    
    let usd_to_idr = get_rate("USD", "IDR").unwrap_or(0.0);
    let btc_to_usd = get_rate("BTC", "USD").unwrap_or(0.0);
    let eth_to_usd = get_rate("ETH", "USD").unwrap_or(0.0);
    let sol_to_usd = get_rate("SOL", "USD").unwrap_or(0.0);
    
    Ok(CurrencyRate {
        usd_to_idr,
        btc_to_usd,
        eth_to_usd,
        sol_to_usd,
        last_updated: utils::get_current_time(),
    })
}