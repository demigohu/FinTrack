export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const OutPoint = IDL.Record({
    'txid' : IDL.Vec(IDL.Nat8),
    'vout' : IDL.Nat32,
  });
  const Utxo = IDL.Record({ 'value' : IDL.Nat64, 'outpoint' : OutPoint });
  const GetUtxosResponse = IDL.Record({ 'utxos' : IDL.Vec(Utxo) });
  const Result_1 = IDL.Variant({ 'Ok' : GetUtxosResponse, 'Err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
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
        [IDL.Float64, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'add_transaction' : IDL.Func(
        [IDL.Float64, IDL.Text, IDL.Text, IDL.Bool, IDL.Text, IDL.Text],
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
    'get_btc_balance' : IDL.Func([], [Result_2], []),
    'get_budgets' : IDL.Func([IDL.Opt(IDL.Text)], [IDL.Vec(Budget)], ['query']),
    'get_currency_rate' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Float64)],
        ['query'],
      ),
    'get_goals' : IDL.Func([], [IDL.Vec(Goal)], ['query']),
    'get_notifications' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Bool],
        [IDL.Vec(Notification)],
        ['query'],
      ),
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
    'update_budget_spent' : IDL.Func([], [Result], []),
    'validate_btc_address' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
