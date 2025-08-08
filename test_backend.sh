#!/bin/bash

# FinTrack Backend Testing Script
# Tests all backend functions including new currency system and HTTP outcall

echo "🚀 Starting FinTrack Backend Testing..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    fi
}

# Function to test a backend function
test_function() {
    local function_name=$1
    local args=$2
    local expected_pattern=$3
    local description=$4
    
    echo ""
    print_status "INFO" "Testing: $description"
    echo "Command: dfx canister call backend $function_name $args"
    
    # Execute the command and capture output
    local output
    if [ -z "$args" ]; then
        output=$(dfx canister call backend $function_name 2>&1)
    else
        output=$(dfx canister call backend $function_name "$args" 2>&1)
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        if [ -n "$expected_pattern" ]; then
            if echo "$output" | grep -q "$expected_pattern"; then
                print_status "PASS" "$description"
                echo "Output: $output"
            else
                print_status "FAIL" "$description - Expected pattern '$expected_pattern' not found"
                echo "Output: $output"
            fi
        else
            print_status "PASS" "$description"
            echo "Output: $output"
        fi
    else
        print_status "FAIL" "$description - Command failed with exit code $exit_code"
        echo "Error: $output"
    fi
}

echo ""
print_status "INFO" "Phase 1: Testing Basic Functions (without rates)"

# Test 1: Get balance breakdown (should return 0.0 for crypto values)
test_function "get_balance_breakdown" "" "total_usd_value = 0.0" "Get balance breakdown (empty rates)"

# Test 2: Get portfolio summary (should return 0.0 for IDR)
test_function "get_portfolio_summary" "" "total_value_idr = 0.0" "Get portfolio summary (empty rates)"

# Test 3: Get currency rates (should return empty rates)
test_function "get_currency_rates" "" "usd_to_idr = 0.0" "Get currency rates (empty)"

# Test 4: Get crypto balances
test_function "get_crypto_balances" "" "0.0 : float64" "Get crypto balances"

echo ""
print_status "INFO" "Phase 2: Testing Transaction Functions"

# Test 5: Add transaction (new format without currency)
test_function "add_transaction" '(100.0, "Test income", true, "Salary", "2025-01-03")' "Transaction added successfully" "Add transaction (new format)"

# Test 6: Add manual transaction
test_function "add_manual_transaction" '(50.0, "Test expense", "expense", "Food", "2025-01-03")' "Transaction added successfully" "Add manual transaction"

# Test 7: Get transactions
test_function "get_transactions" "" "Test income" "Get transactions list"

# Test 8: Get transactions by source
test_function "get_transactions_by_source" '("manual")' "manual" "Get transactions by source"

# Test 9: Get transactions by currency
test_function "get_transactions_by_currency" '("USD")' "USD" "Get transactions by currency"

echo ""
print_status "INFO" "Phase 3: Testing HTTP Outcall (Real-time Rates)"

# Test 10: Fetch real-time rates from CoinGecko
print_status "INFO" "Testing HTTP outcall to CoinGecko API..."
test_function "fetch_real_time_rates" "" "usd_to_idr" "Fetch real-time rates from CoinGecko"

echo ""
print_status "INFO" "Phase 4: Testing Functions with Real Rates"

# Test 11: Get currency rates (after fetch)
test_function "get_currency_rates" "" "usd_to_idr" "Get currency rates (after fetch)"

# Test 12: Get balance breakdown (with real rates)
test_function "get_balance_breakdown" "" "btc_usd_value" "Get balance breakdown (with real rates)"

# Test 13: Get portfolio summary (with real rates)
test_function "get_portfolio_summary" "" "total_value_idr" "Get portfolio summary (with real rates)"

# Test 14: Get total balance USD
test_function "get_total_balance_usd" "" "50.0 : float64" "Get total balance USD"

echo ""
print_status "INFO" "Phase 5: Testing Error Handling"

# Test 15: Add manual transaction with invalid type
test_function "add_manual_transaction" '(100.0, "Invalid transaction", "investment", "Test", "2025-01-03")' "Transaction type must be" "Add manual transaction with invalid type (should fail)"

echo ""
print_status "INFO" "Phase 6: Testing Bitcoin Functions"

# Test 16: Get BTC balance
test_function "get_btc_balance" "" "Result" "Get BTC balance"

# Test 17: Validate BTC address
test_function "validate_btc_address" '("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")' "true" "Validate BTC address"

# Test 18: Format BTC amount
test_function "format_btc_amount" '(0.001)' "0.001" "Format BTC amount"

# Test 19: Satoshis to BTC
test_function "satoshis_to_btc" '(100000000)' "1.0" "Convert satoshis to BTC"

# Test 20: BTC to satoshis
test_function "btc_to_satoshis" '(0.001)' "100_000" "Convert BTC to satoshis"

echo ""
print_status "INFO" "Phase 7: Testing Budget and Goal Functions"

# Test 21: Add budget
test_function "add_budget" '("Food", 500.0, "USD", "2025-01")' "Budget added successfully" "Add budget"

# Test 22: Get budgets
test_function "get_budgets" "" "Food" "Get budgets"

# Test 23: Add goal
test_function "add_goal" '("Save for vacation", "Save money for vacation", 1000.0, 0.0, "USD", "2025-12-31", "Savings", "high")' "Goal added successfully" "Add goal"

# Test 24: Get goals
test_function "get_goals" "" "Save for vacation" "Get goals"

echo ""
print_status "INFO" "Phase 8: Testing User Summary Functions"

# Test 25: Get user summary
test_function "get_user_summary" "" "nat64" "Get user summary"

# Test 26: Get user balance summary
test_function "get_user_balance_summary" "" "float64" "Get user balance summary"

echo ""
print_status "INFO" "Phase 9: Testing Wallet Functions"

# Test 27: Set wallet address
test_function "set_wallet_address" '("BTC", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")' "Wallet address for BTC updated successfully" "Set wallet address"

# Test 28: Get wallet address
test_function "get_wallet_address" '("BTC")' "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" "Get wallet address"

echo ""
print_status "INFO" "Phase 10: Testing Currency Conversion"

# Test 29: Get currency rate
test_function "get_currency_rate" '("USD", "IDR")' "float64" "Get currency rate"

# Test 30: Convert currency
test_function "convert_currency" '(100.0, "USD", "IDR")' "float64" "Convert currency"

echo ""
print_status "INFO" "Final Summary"

# Count total tests and results
echo ""
echo "======================================"
echo "🎯 Testing Complete!"
echo "======================================"
echo ""
echo "📊 Test Summary:"
echo "- Basic Functions: 4 tests"
echo "- Transaction Functions: 5 tests"
echo "- HTTP Outcall: 1 test"
echo "- Real Rates Functions: 4 tests"
echo "- Error Handling: 1 test"
echo "- Bitcoin Functions: 5 tests"
echo "- Budget/Goal Functions: 4 tests"
echo "- User Summary: 2 tests"
echo "- Wallet Functions: 2 tests"
echo "- Currency Conversion: 2 tests"
echo ""
echo "Total: 30 tests"
echo ""
print_status "INFO" "Check the output above for PASS/FAIL results"
echo ""
print_status "INFO" "If all tests PASS, backend is working correctly!"
echo "" 