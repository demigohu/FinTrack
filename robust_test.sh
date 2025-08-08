#!/bin/bash

echo "🛡️  FinTrack Backend Robustness Testing"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

test_function() {
    local function_name=$1
    local args=$2
    local expected_pattern=$3
    local description=$4
    
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
        print_status "FAIL" "$description"
        echo "Error: $output"
    fi
}

echo ""
print_status "INFO" "Phase 1: Testing Enhanced Validation"

# Test 1: Add transaction with invalid amount
test_function "add_manual_transaction" '(-100.0, "Test", "income", "Salary", "2025-01-03")' "Amount must be greater than 0" "Add transaction with negative amount (should fail)"

# Test 2: Add transaction with empty description
test_function "add_manual_transaction" '(100.0, "", "income", "Salary", "2025-01-03")' "Description cannot be empty" "Add transaction with empty description (should fail)"

# Test 3: Add transaction with empty category
test_function "add_manual_transaction" '(100.0, "Test", "income", "", "2025-01-03")' "Category cannot be empty" "Add transaction with empty category (should fail)"

# Test 4: Add transaction with empty date
test_function "add_manual_transaction" '(100.0, "Test", "income", "Salary", "")' "Date cannot be empty" "Add transaction with empty date (should fail)"

# Test 5: Add transaction with invalid type
test_function "add_manual_transaction" '(100.0, "Test", "investment", "Salary", "2025-01-03")' "Transaction type must be" "Add transaction with invalid type (should fail)"

echo ""
print_status "INFO" "Phase 2: Testing Valid Transactions"

# Test 6: Add valid transaction
test_function "add_manual_transaction" '(300.0, "Valid salary", "income", "Salary", "2025-01-03")' "Transaction added successfully" "Add valid transaction"

# Test 7: Add another valid transaction
test_function "add_manual_transaction" '(150.0, "Valid expense", "expense", "Food", "2025-01-03")' "Transaction added successfully" "Add another valid transaction"

echo ""
print_status "INFO" "Phase 3: Testing Mock Currency Rates"

# Test 8: Fetch real-time rates (now with mock rates)
test_function "fetch_real_time_rates" "" "usd_to_idr" "Fetch real-time rates (mock)"

# Test 9: Get currency rates after fetch
test_function "get_currency_rates" "" "15500.0" "Get currency rates (with mock rates)"

# Test 10: Get balance breakdown with rates
test_function "get_balance_breakdown" "" "total_usd_value" "Get balance breakdown (with rates)"

echo ""
print_status "INFO" "Phase 4: Testing Currency Conversion"

# Test 11: Get currency rate (should work now)
test_function "get_currency_rate" '("USD", "IDR")' "15500.0" "Get currency rate"

# Test 12: Convert currency (should work now)
test_function "convert_currency" '(100.0, "USD", "IDR")' "1550000.0" "Convert currency"

echo ""
print_status "INFO" "Phase 5: Testing Core Functions"

# Test 13: Get total balance USD
test_function "get_total_balance_usd" "" "300.0" "Get total balance USD"

# Test 14: Get transactions
test_function "get_transactions" "" "Valid salary" "Get transactions"

# Test 15: Get portfolio summary
test_function "get_portfolio_summary" "" "total_value_usd" "Get portfolio summary"

echo ""
print_status "INFO" "Phase 6: Testing Bitcoin Functions"

# Test 16: Get BTC balance (should work now)
test_function "get_btc_balance" "" "Ok" "Get BTC balance"

# Test 17: Validate BTC address
test_function "validate_btc_address" '("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")' "true" "Validate BTC address"

# Test 18: Format BTC amount
test_function "format_btc_amount" '(0.001)' "₿ 0.00100000" "Format BTC amount"

echo ""
print_status "INFO" "Phase 7: Testing Error Recovery"

# Test 19: Add transaction with whitespace (should trim)
test_function "add_manual_transaction" '(200.0, "  Test with spaces  ", "income", "  Salary  ", "2025-01-03")' "Transaction added successfully" "Add transaction with whitespace (should trim)"

# Test 20: Get final balance
test_function "get_total_balance_usd" "" "500.0" "Get final balance USD"

echo ""
echo "========================================"
print_status "INFO" "Robustness Testing Complete!"
echo "========================================"
echo ""
echo "📊 Robustness Test Summary:"
echo "- Enhanced Validation: 5 tests"
echo "- Valid Transactions: 2 tests"
echo "- Mock Currency Rates: 3 tests"
echo "- Currency Conversion: 2 tests"
echo "- Core Functions: 3 tests"
echo "- Bitcoin Functions: 3 tests"
echo "- Error Recovery: 2 tests"
echo ""
echo "Total: 20 tests"
echo ""
print_status "INFO" "If most tests PASS, backend is robust and ready!"
echo "" 