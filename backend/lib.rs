use candid::{CandidType, Principal};
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse, TransformArgs,
    TransformContext,
};
use ic_cdk::{init, update, query};
use serde::{Deserialize, Serialize};
use serde_json;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Bound,
    DefaultMemoryImpl, StableBTreeMap, Storable,
};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashMap;
// use ic_llm::{Model, prompt}; // COMMENTED OUT: LLM disabled for build compatibility
use ic_cdk::bitcoin_canister::{bitcoin_get_balance, bitcoin_get_utxos, GetBalanceRequest, GetUtxosRequest, GetUtxosResponse, Network};

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct Transaction {
    id: u64,
    amount: f64,
    description: String,
    is_income: bool,
    timestamp: u64,
    date: String, // Format: "YYYY-MM-DD HH:MM:SS"
    category: String,
    currency: String, // "IDR", "USD", "BTC"
}

#[derive(CandidType, Serialize, Deserialize, Clone, Default)]
struct UserData {
    transactions: Vec<Transaction>,
    next_tx_id: u64,
    balance_idr: f64, // Balance dalam IDR
    balance_usd: f64, // Balance dalam USD
    balance_btc: f64, // Balance dalam BTC
    wallet_addresses: HashMap<String, String>, // key: chain (e.g. "BTC"), value: address
}

impl Storable for UserData {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = 
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static USERS: RefCell<StableBTreeMap<Principal, UserData, Memory>> = RefCell::new({
        let memory = MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)));
        StableBTreeMap::init(memory)
    });
}

#[init]
fn init() {}

fn caller() -> Principal {
    ic_cdk::caller()
}

fn timestamp_to_date(timestamp_ns: u64) -> String {
    let timestamp_s = timestamp_ns / 1_000_000_000;
    let seconds_since_epoch = timestamp_s % 86400;
    let days_since_epoch = timestamp_s / 86400;

    let mut year = 1970;
    let mut days = days_since_epoch;
    while days >= 365 {
        let year_days = if year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) { 366 } else { 365 };
        if days >= year_days {
            days -= year_days;
            year += 1;
        } else {
            break;
        }
    }

    let mut month = 1;
    let days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let is_leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    while days >= days_in_month[month - 1] as u64 || (month == 2 && is_leap && days >= 29) {
        let month_days = if month == 2 && is_leap { 29 } else { days_in_month[month - 1] };
        days -= month_days as u64;
        month += 1;
    }

    let day = days + 1;
    let hour = seconds_since_epoch / 3600;
    let minute = (seconds_since_epoch % 3600) / 60;
    let second = seconds_since_epoch % 60;

    format!(
        "{:04}-{:02}-{:02} {:02}:{:02}:{:02}",
        year, month, day, hour, minute, second
    )
}

fn get_year_month(timestamp_ns: u64) -> String {
    let timestamp_s = timestamp_ns / 1_000_000_000;
    let days_since_epoch = timestamp_s / 86400;

    let mut year = 1970;
    let mut days = days_since_epoch;
    while days >= 365 {
        let year_days = if year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) { 366 } else { 365 };
        if days >= year_days {
            days -= year_days;
            year += 1;
        } else {
            break;
        }
    }

    let mut month = 1;
    let days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let is_leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    while days >= days_in_month[month - 1] as u64 || (month == 2 && is_leap && days >= 29) {
        let month_days = if month == 2 && is_leap { 29 } else { days_in_month[month - 1] };
        days -= month_days as u64;
        month += 1;
    }

    format!("{:04}-{:02}", year, month)
}

#[update]
async fn add_transaction(
    amounts: Vec<f64>,
    descriptions: Vec<String>,
    categories: Vec<String>,
    is_incomes: Vec<bool>,
    timestamps: Vec<u64>,
    currencies: Vec<String>, // Tambah parameter currencies
) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    let len = amounts.len();
    if len != descriptions.len() || len != categories.len() || len != is_incomes.len() || len != timestamps.len() || len != currencies.len() {
        return Err("All input arrays must have the same length".to_string());
    }

    if len == 0 {
        return Err("No transactions provided".to_string());
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        
        for i in 0..len {
            let date = timestamp_to_date(timestamps[i]);
            let tx = Transaction {
                id: user_data.next_tx_id,
                amount: amounts[i],
                description: descriptions[i].clone(),
                is_income: is_incomes[i],
                timestamp: timestamps[i],
                date,
                category: categories[i].clone(),
                currency: currencies[i].clone(),
            };
            user_data.transactions.push(tx);
            
            // Update balance sesuai currency
            match currencies[i].as_str() {
                "IDR" => {
                    if is_incomes[i] {
                        user_data.balance_idr += amounts[i];
                    } else {
                        user_data.balance_idr -= amounts[i];
                    }
                },
                "USD" => {
                    if is_incomes[i] {
                        user_data.balance_usd += amounts[i];
                    } else {
                        user_data.balance_usd -= amounts[i];
                    }
                },
                "BTC" => {
                    if is_incomes[i] {
                        user_data.balance_btc += amounts[i];
                    } else {
                        user_data.balance_btc -= amounts[i];
                    }
                },
                _ => {
                    // Default ke IDR
                    if is_incomes[i] {
                        user_data.balance_idr += amounts[i];
                    } else {
                        user_data.balance_idr -= amounts[i];
                    }
                }
            }
            user_data.next_tx_id += 1;
        }
        
        users.insert(user, user_data);
        Ok(format!("Added {} transactions successfully", len))
    })
}

#[update]
async fn add_income(
    amounts: Vec<f64>,
    descriptions: Vec<String>,
    categories: Vec<String>,
    timestamps: Vec<u64>,
    currencies: Vec<String>,
) -> Result<String, String> {
    let is_incomes = vec![true; amounts.len()];
    add_transaction(amounts, descriptions, categories, is_incomes, timestamps, currencies).await
}

#[update]
async fn add_expense(
    amounts: Vec<f64>,
    descriptions: Vec<String>,
    categories: Vec<String>,
    timestamps: Vec<u64>,
    currencies: Vec<String>,
) -> Result<String, String> {
    let is_incomes = vec![false; amounts.len()];
    add_transaction(amounts, descriptions, categories, is_incomes, timestamps, currencies).await
}

// --- Fungsi wallet BTC ---
/// Set wallet address (BTC) untuk user. Hanya bisa diakses jika sudah login Internet Identity.
/// Error handling konsisten Result<String, String>.
#[update]
async fn set_wallet_address(chain: String, address: String) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    if chain.trim().is_empty() || address.trim().is_empty() {
        return Err("Chain and address must not be empty".to_string());
    }
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        user_data.wallet_addresses.insert(chain.clone(), address.clone());
        users.insert(user, user_data);
        Ok(format!("Wallet address for {} set successfully", chain))
    })
}

#[query]
fn get_filtered_transactions(
    transaction_type: String, // "ALL", "INCOME", "EXPENSE"
    category: String,        // Kategori, kosongkan untuk semua kategori
    year_month: String,      // Format "YYYY-MM", kosongkan untuk semua bulan
) -> Result<Vec<Transaction>, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }

    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        
        let filtered_transactions: Vec<Transaction> = user_data.transactions.iter()
            .filter(|tx| {
                // Filter berdasarkan tipe transaksi
                let type_match = match transaction_type.as_str() {
                    "ALL" => true,
                    "INCOME" => tx.is_income,
                    "EXPENSE" => !tx.is_income,
                    _ => false, // Invalid type
                };
                
                // Filter berdasarkan kategori
                let category_match = category.is_empty() || tx.category == category;
                
                // Filter berdasarkan bulan
                let month_match = year_month.is_empty() || get_year_month(tx.timestamp) == year_month;
                
                type_match && category_match && month_match
            })
            .cloned()
            .collect();
        
        Ok(filtered_transactions)
    })
}

#[query]
fn get_income(year_month: String, currency: String) -> Result<f64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        let total_income = if year_month.is_empty() {
            user_data.transactions.iter()
                .filter(|tx| tx.is_income && tx.currency == currency)
                .map(|tx| tx.amount)
                .sum()
        } else {
            user_data.transactions.iter()
                .filter(|tx| tx.is_income && get_year_month(tx.timestamp) == year_month && tx.currency == currency)
                .map(|tx| tx.amount)
                .sum()
        };
        // Normalkan -0.0 menjadi +0.0
        let total_income = if total_income == 0.0 { 0.0 } else { total_income };
        Ok(total_income)
    })
}

#[query]
fn get_expense(year_month: String, currency: String) -> Result<f64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        let total_expense = if year_month.is_empty() {
            user_data.transactions.iter()
                .filter(|tx| !tx.is_income && tx.currency == currency)
                .map(|tx| tx.amount)
                .sum()
        } else {
            user_data.transactions.iter()
                .filter(|tx| !tx.is_income && get_year_month(tx.timestamp) == year_month && tx.currency == currency)
                .map(|tx| tx.amount)
                .sum()
        };
        // Normalkan -0.0 menjadi +0.0
        let total_expense = if total_expense == 0.0 { 0.0 } else { total_expense };
        Ok(total_expense)
    })
}

#[query]
fn get_balance(year_month: String, currency: String) -> Result<f64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        if year_month.is_empty() {
            // Return balance sesuai currency
            match currency.as_str() {
                "IDR" => Ok(user_data.balance_idr),
                "USD" => Ok(user_data.balance_usd),
                "BTC" => Ok(user_data.balance_btc),
                _ => Ok(user_data.balance_idr), // Default ke IDR
            }
        } else {
            // Calculate balance untuk bulan tertentu sesuai currency
            let total_income: f64 = user_data.transactions.iter()
                .filter(|tx| tx.is_income && get_year_month(tx.timestamp) == year_month && tx.currency == currency)
                .map(|tx| tx.amount)
                .sum();
            let total_expense: f64 = user_data.transactions.iter()
                .filter(|tx| !tx.is_income && get_year_month(tx.timestamp) == year_month && tx.currency == currency)
                .map(|tx| tx.amount)
                .sum();
            Ok(total_income - total_expense)
        }
    })
}

#[query]
fn get_manual_balance(year_month: String) -> Result<f64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        if year_month.is_empty() {
            Ok(user_data.balance_idr) // Default ke IDR balance
        } else {
            let total_income: f64 = user_data.transactions.iter()
                .filter(|tx| tx.is_income && get_year_month(tx.timestamp) == year_month)
                .map(|tx| tx.amount)
                .sum();
            let total_expense: f64 = user_data.transactions.iter()
                .filter(|tx| !tx.is_income && get_year_month(tx.timestamp) == year_month)
                .map(|tx| tx.amount)
                .sum();
            Ok(total_income - total_expense)
        }
    })
}

#[update]
async fn get_usd_to_idr_rate() -> Result<f64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    // Gunakan API yang lebih reliable untuk USD/IDR
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=idr".to_string();
    let request_headers = vec![HttpHeader {
        name: "User-Agent".to_string(),
        value: "fintrack.canister".to_string(),
    }];
    let request = CanisterHttpRequestArgument {
        url,
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2000),
        transform: Some(TransformContext::from_name("transform".to_string(), vec![])),
        headers: request_headers,
    };
    match http_request(request, 100_000_000).await {
        Ok((response,)) => {
            let str_body = String::from_utf8(response.body)
                .map_err(|_| "Failed to decode response body".to_string())?;
            let json: serde_json::Value = serde_json::from_str(&str_body)
                .map_err(|_| "Failed to parse JSON".to_string())?;
            
            // Debug: print response untuk melihat struktur JSON
            ic_cdk::println!("Response: {}", str_body);
            
            // Coba berbagai kemungkinan path
            let usd_to_idr = json["usd-coin"]["idr"].as_f64()
                .or_else(|| json["usd"]["idr"].as_f64())
                .or_else(|| {
                    // Fallback: gunakan rate tetap jika API gagal
                    ic_cdk::println!("Using fallback USD/IDR rate");
                    Some(15500.0) // Rate USD/IDR sekitar 15,500
                })
                .ok_or("No idr in response".to_string())?;
            Ok(usd_to_idr)
        }
        Err((code, msg)) => Err(format!("HTTP request failed. Code: {:?}, Msg: {}", code, msg)),
    }
}

#[query]
fn transform(raw: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: raw.response.status,
        body: raw.response.body,
        headers: vec![],
    }
}

#[query]
fn get_report() -> Result<Vec<Transaction>, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        Ok(user_data.transactions.clone())
    })
}

#[query]
fn get_report_by_month(year_month: String) -> Result<Vec<Transaction>, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        let filtered_transactions: Vec<Transaction> = user_data
            .transactions
            .iter()
            .filter(|tx| get_year_month(tx.timestamp) == year_month)
            .cloned()
            .collect();
        Ok(filtered_transactions)
    })
}

#[query]
fn get_income_report(year_month: String) -> Result<Vec<Transaction>, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        let filtered_transactions: Vec<Transaction> = user_data
            .transactions
            .iter()
            .filter(|tx| {
                // Filter berdasarkan tipe income
                let is_income_match = tx.is_income;
                // Filter berdasarkan bulan (jika year_month tidak kosong)
                let month_match = year_month.is_empty() || get_year_month(tx.timestamp) == year_month;
                is_income_match && month_match
            })
            .cloned()
            .collect();
        Ok(filtered_transactions)
    })
}

#[query]
fn get_expense_report(year_month: String) -> Result<Vec<Transaction>, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        let filtered_transactions: Vec<Transaction> = user_data
            .transactions
            .iter()
            .filter(|tx| {
                // Filter berdasarkan tipe expense
                let is_expense_match = !tx.is_income;
                // Filter berdasarkan bulan (jika year_month tidak kosong)
                let month_match = year_month.is_empty() || get_year_month(tx.timestamp) == year_month;
                is_expense_match && month_match
            })
            .cloned()
            .collect();
        Ok(filtered_transactions)
    })
}

#[query]
fn get_analysis() -> Result<(f64, f64), String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    USERS.with(|users| {
        let users = users.borrow();
        let user_data = users.get(&user).unwrap_or_default(); // Default ke UserData kosong
        let mut income = 0.0;
        let mut expenses = 0.0;
        for tx in &user_data.transactions {
            if tx.is_income {
                income += tx.amount;
            } else {
                expenses += tx.amount;
            }
        }
        Ok((income, expenses))
    })
}

#[update]
async fn get_ai_advice(
    total_income: String,
    total_expenses: String,
    balance: String,
) -> Result<String, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    
    // Buat prompt dengan nilai dari frontend
    let prompt_text = format!(
        "User has total income {} and total expenses {}. Current balance: {}. Provide specific financial advice in 2-3 paragraphs.",
        total_income, total_expenses, balance
    );
    
    ic_cdk::println!("Prompt: {}", prompt_text); // Logging untuk debugging
    
    // Panggil canister LLM lokal
    let llm_canister_id = Principal::from_text("w36hm-eqaaa-aaaal-qr76a-cai")
        .map_err(|_| "Invalid LLM canister ID".to_string())?;
    
    // Struktur request untuk LLM canister
    #[derive(CandidType, Deserialize)]
    struct LlmRequest {
        prompt: String,
        max_tokens: Option<u32>,
        temperature: Option<f32>,
    }
    
    #[derive(CandidType, Deserialize)]
    struct LlmResponse {
        response: String,
    }
    
    let request = LlmRequest {
        prompt: prompt_text,
        max_tokens: Some(500),
        temperature: Some(0.7),
    };
    
    // Panggil canister LLM menggunakan inter-canister call
    let response: Result<(LlmResponse,), _> = ic_cdk::call(llm_canister_id, "generate", (request,)).await;
    
    match response {
        Ok((llm_response,)) => {
            if llm_response.response.is_empty() {
                Err("No advice available due to AI error".to_string())
            } else {
                Ok(llm_response.response)
            }
        }
        Err((code, msg)) => Err(format!("LLM call failed. Code: {:?}, Msg: {}", code, msg)),
    }
}

/// Get saldo BTC user dari Chain Fusion (Regtest). Hanya bisa diakses jika sudah login Internet Identity.
/// Error handling konsisten Result<String, String>.
#[update]
async fn get_btc_balance() -> Result<u64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    let address = USERS.with(|users| {
        let users = users.borrow();
        users.get(&user)
            .and_then(|ud| ud.wallet_addresses.get("BTC").cloned())
    });
    let address = match address {
        Some(addr) => addr,
        None => return Err("BTC address not set for user".to_string()),
    };
    let req = GetBalanceRequest {
        address,
        network: Network::Regtest,
        min_confirmations: Some(1),
    };
    bitcoin_get_balance(&req).await.map_err(|e| format!("{:?}", e))
}

/// Fetch transaksi BTC user (UTXO) dan simpan sebagai Transaction. Hanya bisa diakses jika sudah login Internet Identity.
/// Error handling konsisten Result<String, String>.
#[update]
async fn fetch_btc_transactions() -> Result<GetUtxosResponse, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    let address = USERS.with(|users| {
        let users = users.borrow();
        users.get(&user)
            .and_then(|ud| ud.wallet_addresses.get("BTC").cloned())
    });
    let address = match address {
        Some(addr) => addr,
        None => return Err("BTC address not set for user".to_string()),
    };
    let req = GetUtxosRequest {
        address,
        network: Network::Regtest,
        filter: None,
    };
    let utxos_response = bitcoin_get_utxos(&req).await.map_err(|e| format!("{:?}", e))?;

    // Otomasi pemasukan: simpan UTXO baru ke transactions
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let mut user_data = users.get(&user).unwrap_or_default();
        let now = ic_cdk::api::time();
        for utxo in &utxos_response.utxos {
            let txid_hex = hex::encode(&utxo.outpoint.txid);
            let vout = utxo.outpoint.vout;
            // Cek apakah sudah ada transaksi dengan txid+vout ini
            let already_recorded = user_data.transactions.iter().any(|tx| {
                tx.description.contains(&txid_hex) && tx.category == "Crypto-BTC" && tx.amount == (utxo.value as f64 / 100_000_000.0)
            });
            if !already_recorded {
                let amount_btc = utxo.value as f64 / 100_000_000.0;
                let desc = format!("BTC UTXO received (txid: {}, vout: {})", txid_hex, vout);
                let date = timestamp_to_date(now);
                let tx = Transaction {
                    id: user_data.next_tx_id,
                    amount: amount_btc, // Simpan dalam BTC
                    description: desc,
                    is_income: true,
                    timestamp: now,
                    date,
                    category: "Crypto-BTC".to_string(),
                    currency: "BTC".to_string(),
                };
                user_data.transactions.push(tx);
                user_data.next_tx_id += 1;
                // Update balance BTC
                user_data.balance_btc += amount_btc;
            }
        }
        users.insert(user, user_data);
    });

    Ok(utxos_response)
}

/// Get kurs BTC ke IDR dan USD dari Coingecko (internal function)
async fn get_btc_rates_internal() -> Result<(f64, f64), String> {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr,usd".to_string();
    let request_headers = vec![HttpHeader {
        name: "User-Agent".to_string(),
        value: "fintrack.canister".to_string(),
    }];
    let request = CanisterHttpRequestArgument {
        url,
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2000),
        transform: Some(TransformContext::from_name("transform".to_string(), vec![])),
        headers: request_headers,
    };
    match http_request(request, 100_000_000).await {
        Ok((response,)) => {
            let str_body = String::from_utf8(response.body)
                .map_err(|_| "Failed to decode response body".to_string())?;
            let json: serde_json::Value = serde_json::from_str(&str_body)
                .map_err(|_| "Failed to parse JSON".to_string())?;
            let btc_to_idr = json["bitcoin"]["idr"].as_f64().ok_or("No idr in response".to_string())?;
            let btc_to_usd = json["bitcoin"]["usd"].as_f64().ok_or("No usd in response".to_string())?;
            Ok((btc_to_idr, btc_to_usd))
        }
        Err((code, msg)) => Err(format!("HTTP request failed. Code: {:?}, Msg: {}", code, msg)),
    }
}

/// Get kurs BTC ke IDR dan USD dari Coingecko
#[update]
async fn get_btc_rates() -> Result<(f64, f64), String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    get_btc_rates_internal().await
}

/// Konversi amount dari satu currency ke currency lain
#[query]
fn convert_amount(amount: f64, from_currency: String, to_currency: String) -> Result<f64, String> {
    let user = caller();
    if user == Principal::anonymous() {
        return Err("Please log in with Internet Identity".to_string());
    }
    
    // Untuk saat ini gunakan rate tetap, nanti bisa diambil dari cache atau API
    let btc_to_idr_rate = 1_000_000_000.0;
    let usd_to_idr_rate = 15_500.0;
    
    match (from_currency.as_str(), to_currency.as_str()) {
        ("IDR", "IDR") => Ok(amount),
        ("USD", "IDR") => Ok(amount * usd_to_idr_rate),
        ("BTC", "IDR") => Ok(amount * btc_to_idr_rate),
        ("IDR", "USD") => Ok(amount / usd_to_idr_rate),
        ("BTC", "USD") => Ok(amount * btc_to_idr_rate / usd_to_idr_rate),
        ("IDR", "BTC") => Ok(amount / btc_to_idr_rate),
        ("USD", "BTC") => Ok(amount * usd_to_idr_rate / btc_to_idr_rate),
        _ => Err("Unsupported currency conversion".to_string()),
    }
}

ic_cdk::export_candid!();