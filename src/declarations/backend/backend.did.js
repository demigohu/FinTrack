export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const OutPoint = IDL.Record({
    'txid' : IDL.Vec(IDL.Nat8),
    'vout' : IDL.Nat32,
  });
  const Utxo = IDL.Record({ 'value' : IDL.Nat64, 'outpoint' : OutPoint });
  const GetUtxosResponse = IDL.Record({ 'utxos' : IDL.Vec(Utxo) });
  const Result_1 = IDL.Variant({ 'Ok' : GetUtxosResponse, 'Err' : IDL.Text });
  const CurrencyRate = IDL.Record({
    'btc_to_usd' : IDL.Float64,
    'last_updated' : IDL.Nat64,
    'eth_to_usd' : IDL.Float64,
    'sol_to_usd' : IDL.Float64,
    'usd_to_idr' : IDL.Float64,
  });
  const Result_2 = IDL.Variant({ 'Ok' : CurrencyRate, 'Err' : IDL.Text });
  const BalanceBreakdown = IDL.Record({
    'eth_balance' : IDL.Float64,
    'usd_balance' : IDL.Float64,
    'sol_usd_value' : IDL.Float64,
    'btc_usd_value' : IDL.Float64,
    'negative_reason' : IDL.Opt(IDL.Text),
    'btc_balance' : IDL.Float64,
    'eth_usd_value' : IDL.Float64,
    'sol_balance' : IDL.Float64,
    'total_usd_value' : IDL.Float64,
    'is_negative' : IDL.Bool,
  });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const Budget = IDL.Record({
    'id' : IDL.Nat64,
    'updated_at' : IDL.Nat64,
    'period' : IDL.Text,
    'created_at' : IDL.Nat64,
    'spent' : IDL.Float64,
    'currency' : IDL.Text,
    'category' : IDL.Text,
    'budget' : IDL.Float64,
  });
  const Goal = IDL.Record({
    'id' : IDL.Nat64,
    'status' : IDL.Text,
    'title' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'description' : IDL.Text,
    'deadline' : IDL.Text,
    'created_at' : IDL.Nat64,
    'current_amount' : IDL.Float64,
    'currency' : IDL.Text,
    'target_amount' : IDL.Float64,
    'category' : IDL.Text,
    'priority' : IDL.Text,
  });
  const Notification = IDL.Record({
    'id' : IDL.Nat64,
    'is_read' : IDL.Bool,
    'title' : IDL.Text,
    'type_' : IDL.Text,
    'message' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'category' : IDL.Text,
  });
  const PortfolioSummary = IDL.Record({
    'diversification_score' : IDL.Float64,
    'balance_breakdown' : BalanceBreakdown,
    'asset_allocation' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Float64)),
    'total_value_idr' : IDL.Float64,
    'total_value_usd' : IDL.Float64,
  });
  const Transaction = IDL.Record({
    'id' : IDL.Nat64,
    'conversion_rate' : IDL.Opt(IDL.Float64),
    'fee' : IDL.Opt(IDL.Float64),
    'confirmations' : IDL.Opt(IDL.Nat32),
    'transaction_type' : IDL.Opt(IDL.Text),
    'source' : IDL.Opt(IDL.Text),
    'is_income' : IDL.Bool,
    'date' : IDL.Text,
    'txid' : IDL.Opt(IDL.Text),
    'description' : IDL.Text,
    'currency' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'converted_currency' : IDL.Opt(IDL.Text),
    'category' : IDL.Text,
    'converted_amount' : IDL.Opt(IDL.Float64),
    'amount' : IDL.Float64,
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpResponse = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const TransformArgs = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : HttpResponse,
  });
  return IDL.Service({
    'add_budget' : IDL.Func(
        [IDL.Text, IDL.Float64, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'add_goal' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Float64,
          IDL.Float64,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
        ],
        [Result],
        [],
      ),
    'add_manual_transaction' : IDL.Func(
        [IDL.Float64, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'add_transaction' : IDL.Func(
        [IDL.Float64, IDL.Text, IDL.Bool, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'btc_to_satoshis' : IDL.Func([IDL.Float64], [IDL.Nat64], ['query']),
    'convert_currency' : IDL.Func(
        [IDL.Float64, IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Float64)],
        ['query'],
      ),
    'fetch_btc_transactions' : IDL.Func([], [Result_1], []),
    'fetch_real_time_rates' : IDL.Func([], [Result_2], []),
    'format_btc_amount' : IDL.Func([IDL.Float64], [IDL.Text], ['query']),
    'get_all_rates' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, IDL.Float64))],
        ['query'],
      ),
    'get_balance' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Float64],
        ['query'],
      ),
    'get_balance_breakdown' : IDL.Func([], [BalanceBreakdown], ['query']),
    'get_btc_balance' : IDL.Func([], [Result_3], []),
    'get_budgets' : IDL.Func([IDL.Opt(IDL.Text)], [IDL.Vec(Budget)], ['query']),
    'get_crypto_balances' : IDL.Func(
        [],
        [IDL.Float64, IDL.Float64, IDL.Float64],
        ['query'],
      ),
    'get_currency_rate' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Float64)],
        ['query'],
      ),
    'get_currency_rates' : IDL.Func([], [CurrencyRate], ['query']),
    'get_goals' : IDL.Func([], [IDL.Vec(Goal)], ['query']),
    'get_notifications' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Bool],
        [IDL.Vec(Notification)],
        ['query'],
      ),
    'get_portfolio_summary' : IDL.Func([], [PortfolioSummary], ['query']),
    'get_total_balance_usd' : IDL.Func([], [IDL.Float64], ['query']),
    'get_total_expense' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Float64],
        ['query'],
      ),
    'get_total_income' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text)],
        [IDL.Float64],
        ['query'],
      ),
    'get_transactions' : IDL.Func([], [IDL.Vec(Transaction)], ['query']),
    'get_transactions_by_currency' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'get_transactions_by_period' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'get_transactions_by_source' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'get_unread_notification_count' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_user_balance_summary' : IDL.Func(
        [],
        [IDL.Float64, IDL.Float64, IDL.Float64],
        ['query'],
      ),
    'get_user_summary' : IDL.Func(
        [],
        [IDL.Nat64, IDL.Nat64, IDL.Nat64, IDL.Nat64],
        ['query'],
      ),
    'get_wallet_address' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'mark_notification_read' : IDL.Func([IDL.Nat64], [Result], []),
    'satoshis_to_btc' : IDL.Func([IDL.Nat64], [IDL.Float64], ['query']),
    'set_currency_rate' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64],
        [Result],
        [],
      ),
    'set_wallet_address' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'sync_blockchain_transactions' : IDL.Func([], [Result], []),
    'transform' : IDL.Func([TransformArgs], [HttpResponse], ['query']),
    'update_budget_spent' : IDL.Func([], [Result], []),
    'update_currency_rates' : IDL.Func(
        [IDL.Float64, IDL.Float64, IDL.Float64, IDL.Float64],
        [Result],
        [],
      ),
    'validate_btc_address' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
