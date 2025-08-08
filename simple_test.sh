#!/bin/bash

echo "🧪 Simple FinTrack Backend Testing"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

test_function() {
    local function_name=$1
    local args=$2
    local description=$3
    
    echo ""
    print_status "INFO" "Testing: $description"
    echo "Command: dfx canister call backend $function_name $args"
    
    local output
    if [ -z "$args" ]; then
        output=$(dfx canister call backend $function_name 2>&1)
    else
        output=$(dfx canister call backend $function_name "$args" 2>&1)
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_status "PASS" "$description"
        echo "Output: $output"
    else
        print_status "FAIL" "$description"
        echo "Error: $output"
    fi
}

echo ""
print_status "INFO" "Testing Core Functions"

# Test 1: Get balance breakdown
test_function "get_balance_breakdown" "" "Get balance breakdown"

# Test 2: Get portfolio summary
test_function "get_portfolio_summary" "" "Get portfolio summary"

# Test 3: Get currency rates
test_function "get_currency_rates" "" "Get currency rates"

# Test 4: Add transaction
test_function "add_transaction" '(200.0, "Test salary", true, "Salary", "2025-01-03")' "Add transaction"

# Test 5: Add manual transaction
test_function "add_manual_transaction" '(75.0, "Test expense", "expense", "Food", "2025-01-03")' "Add manual transaction"

# Test 6: Get transactions
test_function "get_transactions" "" "Get transactions"

# Test 7: Get total balance USD
test_function "get_total_balance_usd" "" "Get total balance USD"

# Test 8: Add budget
test_function "add_budget" '("Transport", 300.0, "USD", "2025-01")' "Add budget"

# Test 9: Get budgets
test_function "get_budgets" "" "Get budgets"

# Test 10: Add goal
test_function "add_goal" '("Buy laptop", "Save for new laptop", 2000.0, 0.0, "USD", "2025-06-30", "Electronics", "high")' "Add goal"

# Test 11: Get goals
test_function "get_goals" "" "Get goals"

# Test 12: Set wallet address
test_function "set_wallet_address" '("BTC", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")' "Set wallet address"

# Test 13: Get wallet address
test_function "get_wallet_address" '("BTC")' "Get wallet address"

# Test 14: Validate BTC address
test_function "validate_btc_address" '("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")' "Validate BTC address"

# Test 15: Format BTC amount
test_function "format_btc_amount" '(0.001)' "Format BTC amount"

echo ""
echo "=================================="
print_status "INFO" "Testing Complete!"
echo "=================================="
echo ""
echo "📊 Summary:"
echo "- Core Functions: 15 tests"
echo "- Focus on working features"
echo "- Skip HTTP outcall for now"
echo ""
print_status "INFO" "If most tests PASS, backend is ready for frontend!" 