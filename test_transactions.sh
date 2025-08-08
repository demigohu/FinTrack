#!/bin/bash

echo "=== Testing Transaction Backend Functions ==="

echo ""
echo "1. Getting all transactions:"
dfx canister call backend get_transactions

echo ""
echo "2. Getting transactions by source (blockchain):"
dfx canister call backend get_transactions_by_source '("blockchain")'

echo ""
echo "3. Getting transactions by source (manual):"
dfx canister call backend get_transactions_by_source '("manual")'

echo ""
echo "4. Getting BTC balance:"
dfx canister call backend get_btc_balance

echo ""
echo "5. Getting wallet address:"
dfx canister call backend get_wallet_address '("BTC")'

echo ""
echo "6. Syncing blockchain transactions:"
dfx canister call backend sync_blockchain_transactions

echo ""
echo "7. Getting transactions again after sync:"
dfx canister call backend get_transactions

echo ""
echo "8. Getting balance breakdown:"
dfx canister call backend get_balance_breakdown

echo ""
echo "=== Test Complete ===" 