# FinTrack - Multi-Currency Financial Tracking on Internet Computer

## 📋 Project Summary

**FinTrack** is a comprehensive financial tracking application built on the Internet Computer (ICP) that supports multiple currencies (IDR, USD, BTC) with real-time conversion rates from Coingecko APIs. The application provides users with a complete financial management solution including transaction tracking, balance monitoring, Bitcoin wallet integration, and AI-powered financial advice.

## 🚀 Live Demo

- **Frontend:** [FinTrack Dashboard](https://aj65n-aiaaa-aaaap-qqf5a-cai.icp0.io/)
- **Backend:** [FinTrack Backend](https://aj65n-aiaaa-aaaap-qqf5a-cai.icp0.io/)

## 🎯 Project Overview

### Core Features

1. **Multi-Currency Support**
   - Indonesian Rupiah (IDR)
   - US Dollar (USD) 
   - Bitcoin (BTC)
   - Real-time conversion using Coingecko APIs

2. **Transaction Management**
   - Add income and expenses
   - Categorize transactions
   - Bulk transaction recording
   - Monthly/yearly filtering

3. **Bitcoin Integration**
   - BTC wallet address management
   - Real-time BTC balance checking
   - UTXO transaction monitoring
   - Automatic income recording from BTC transactions

4. **Financial Analytics**
   - Balance tracking per currency
   - Income/expense summaries
   - Monthly financial reports
   - AI-powered financial advice

5. **User Authentication**
   - Internet Identity integration
   - Secure user data storage
   - Per-user transaction isolation

## 🏗️ Architecture

### Backend (Rust + ICP)

#### Core Data Structures

```rust
#[derive(CandidType, Serialize, Deserialize, Clone)]
struct Transaction {
    id: u64,
    amount: f64,
    description: String,
    is_income: bool,
    timestamp: u64,
    date: String,
    category: String,
    currency: String, // "IDR", "USD", "BTC"
}

#[derive(CandidType, Serialize, Deserialize, Clone, Default)]
struct UserData {
    transactions: Vec<Transaction>,
    next_tx_id: u64,
    balance_idr: f64,
    balance_usd: f64,
    balance_btc: f64,
    wallet_addresses: HashMap<String, String>,
}
```

#### Key Backend Functions

1. **Transaction Management**
   - `add_transaction()` - Add transactions with currency support
   - `add_income()` - Add income transactions
   - `add_expense()` - Add expense transactions

2. **Balance & Analytics**
   - `get_balance(month, currency)` - Get balance by currency
   - `get_income(month, currency)` - Get income by currency
   - `get_expense(month, currency)` - Get expense by currency

3. **Real-time Rates**
   - `get_btc_rates()` - Fetch BTC/IDR and BTC/USD rates from Coingecko
   - `get_usd_to_idr_rate()` - Fetch USD/IDR rate from Coingecko

4. **Bitcoin Integration**
   - `get_btc_balance()` - Get BTC balance from Chain Fusion
   - `fetch_btc_transactions()` - Fetch and auto-record BTC UTXOs
   - `set_wallet_address()` - Set BTC wallet address

5. **AI Features**
   - `get_ai_advice()` - Generate financial advice using LLM canister

### Frontend (React + Vite)

#### Key Components

1. **AuthContext.jsx** - Global state management
   - User authentication
   - Currency conversion logic
   - Real-time rates caching
   - Balance calculations

2. **App.jsx** - Main dashboard
   - Expense overview
   - Income/balance cards
   - Currency selector
   - Month filtering

3. **AddTransaction.jsx** - Transaction modal
   - Multi-currency input
   - Category selection
   - Bulk transaction support

4. **ReportFinancial.jsx** - Financial reports
   - Transaction history
   - Filtering by type/category
   - Summary analytics

5. **BtcWalletPage.jsx** - Bitcoin wallet
   - Wallet address management
   - Real-time balance checking
   - UTXO monitoring

## 🔧 Technical Implementation

### Multi-Currency System

#### Backend Storage
```rust
// Separate balance tracking per currency
balance_idr: f64, // Balance in IDR
balance_usd: f64, // Balance in USD  
balance_btc: f64, // Balance in BTC
```

#### Frontend Conversion
```javascript
// Real-time conversion using Coingecko rates
const convertAmountWithRates = (amount, fromCurrency, toCurrency) => {
  if (fromLower === "usd" && toLower === "idr" && usdToIdr) {
    return amount * usdToIdr;
  }
  // ... other conversions
};
```

#### Cache Management
```javascript
// localStorage caching for performance
const loadRatesFromStorage = () => {
  const stored = localStorage.getItem('fintrack_rates');
  if (stored && now - rates.timestamp < 5 * 60 * 1000) {
    // Use cached rates if less than 5 minutes old
  }
};
```

### Bitcoin Integration

#### Chain Fusion Integration
```rust
// Fetch BTC balance from Chain Fusion
let req = GetBalanceRequest {
    address,
    network: Network::Regtest,
    min_confirmations: Some(1),
};
bitcoin_get_balance(&req).await
```

#### Automatic Income Recording
```rust
// Auto-record BTC UTXOs as income
for utxo in &utxos_response.utxos {
    let amount_btc = utxo.value as f64 / 100_000_000.0;
    let tx = Transaction {
        amount: amount_btc,
        currency: "BTC".to_string(),
        is_income: true,
        // ...
    };
}
```

### Real-time Rate Updates

#### Coingecko API Integration
```rust
// Fetch BTC rates
let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr,usd";
let response = http_request(request, 100_000_000).await;
```

#### Frontend Rate Management
```javascript
// Update rates every 5 minutes
useEffect(() => {
  fetchAllRates();
  const interval = setInterval(fetchAllRates, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [isLoggedIn]);
```

## 🎨 User Experience

### Dashboard Features

1. **Multi-Currency Display**
   - Real-time currency conversion
   - Instant balance updates
   - Currency selector dropdown

2. **Transaction Recording**
   - Modal-based input
   - Category selection
   - Currency-specific amounts
   - Bulk transaction support

3. **Financial Reports**
   - Monthly filtering
   - Income/expense breakdown
   - Transaction history
   - Balance summaries

4. **Bitcoin Wallet**
   - Regtest network support
   - Real-time balance checking
   - UTXO monitoring
   - Automatic income recording

## 🔐 Security Features

### Internet Identity Integration
- Secure user authentication
- Principal-based user isolation
- Anonymous user prevention

### Data Privacy
- Per-user transaction storage
- Encrypted data transmission
- Secure canister communication

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start local environment
dfx start --background

# Deploy canisters
dfx deploy

# Build frontend
cd frontend && npm run build
```

### Mainnet Deployment
```bash
# Deploy to mainnet
dfx deploy --network ic

# URLs will be provided in output
```

## 📊 Performance Optimizations

### Backend Optimizations
- StableBTreeMap for efficient storage
- Async HTTP requests for rate fetching
- Batch transaction processing
- Memory-efficient data structures

### Frontend Optimizations
- localStorage caching for rates
- React Context for state management
- Lazy loading of components
- Efficient re-rendering with useCallback

## 🔮 Future Enhancements

1. **Multi-Chain Support**
   - **Ethereum (EVM) Integration**
     - ETH wallet address management
     - ERC-20 token tracking
     - Smart contract interaction
     - Gas fee monitoring
   - **Solana Integration**
     - SOL wallet address management
     - SPL token tracking
     - Program interaction
     - Transaction fee monitoring

2. **Additional Currencies**
   - EUR, GBP, JPY support
   - More crypto currencies
   - Custom currency pairs

3. **Advanced Analytics**
   - Spending patterns analysis
   - Budget planning tools
   - Investment tracking
   - Cross-chain portfolio view

4. **Mobile App**
   - React Native implementation
   - Push notifications
   - Offline support

5. **DeFi Integration**
   - Yield farming tracking
   - Liquidity pool monitoring
   - DeFi protocol integration
   - Cross-chain DeFi analytics

## 🛠️ Technology Stack

### Backend
- **Language:** Rust
- **Framework:** Internet Computer (ICP)
- **Storage:** StableBTreeMap
- **APIs:** Coingecko, Chain Fusion
- **Authentication:** Internet Identity

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State Management:** React Context

### Infrastructure
- **Blockchain:** Internet Computer
- **Canisters:** Backend + Frontend + Internet Identity
- **APIs:** Coingecko, Chain Fusion
- **Storage:** ICP stable memory

## 📈 Key Metrics

- **Multi-Currency Support:** 3 currencies (IDR, USD, BTC)
- **Real-time Rates:** Coingecko API integration
- **Transaction Types:** Income, Expense, Bulk
- **Bitcoin Integration:** Regtest network support
- **User Authentication:** Internet Identity
- **Performance:** < 2s load time with caching

## 📞 Contact

- **Project:** FinTrack
- **GitHub:** [https://github.com/demigohu/FinTrack]

---

*Built with ❤️ on Internet Computer*

