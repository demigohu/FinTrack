export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Float64, 'Err' : IDL.Text });
  const Outpoint = IDL.Record({
    'txid' : IDL.Vec(IDL.Nat8),
    'vout' : IDL.Nat32,
  });
  const Utxo = IDL.Record({
    'height' : IDL.Nat32,
    'value' : IDL.Nat64,
    'outpoint' : Outpoint,
  });
  const GetUtxosResponse = IDL.Record({
    'next_page' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'tip_height' : IDL.Nat32,
    'tip_block_hash' : IDL.Vec(IDL.Nat8),
    'utxos' : IDL.Vec(Utxo),
  });
  const Result_2 = IDL.Variant({ 'Ok' : GetUtxosResponse, 'Err' : IDL.Text });
  const Result_3 = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Float64, IDL.Float64),
    'Err' : IDL.Text,
  });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const Transaction = IDL.Record({
    'id' : IDL.Nat64,
    'is_income' : IDL.Bool,
    'date' : IDL.Text,
    'description' : IDL.Text,
    'currency' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'category' : IDL.Text,
    'amount' : IDL.Float64,
  });
  const Result_5 = IDL.Variant({
    'Ok' : IDL.Vec(Transaction),
    'Err' : IDL.Text,
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
    'add_expense' : IDL.Func(
        [
          IDL.Vec(IDL.Float64),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Nat64),
          IDL.Vec(IDL.Text),
        ],
        [Result],
        [],
      ),
    'add_income' : IDL.Func(
        [
          IDL.Vec(IDL.Float64),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Nat64),
          IDL.Vec(IDL.Text),
        ],
        [Result],
        [],
      ),
    'add_transaction' : IDL.Func(
        [
          IDL.Vec(IDL.Float64),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Bool),
          IDL.Vec(IDL.Nat64),
          IDL.Vec(IDL.Text),
        ],
        [Result],
        [],
      ),
    'convert_amount' : IDL.Func(
        [IDL.Float64, IDL.Text, IDL.Text],
        [Result_1],
        ['query'],
      ),
    'fetch_btc_transactions' : IDL.Func([], [Result_2], []),
    'get_ai_advice' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'get_analysis' : IDL.Func([], [Result_3], ['query']),
    'get_balance' : IDL.Func([IDL.Text, IDL.Text], [Result_1], ['query']),
    'get_btc_balance' : IDL.Func([], [Result_4], []),
    'get_btc_rates' : IDL.Func([], [Result_3], []),
    'get_expense' : IDL.Func([IDL.Text, IDL.Text], [Result_1], ['query']),
    'get_expense_report' : IDL.Func([IDL.Text], [Result_5], ['query']),
    'get_filtered_transactions' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_5],
        ['query'],
      ),
    'get_income' : IDL.Func([IDL.Text, IDL.Text], [Result_1], ['query']),
    'get_income_report' : IDL.Func([IDL.Text], [Result_5], ['query']),
    'get_manual_balance' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'get_report' : IDL.Func([], [Result_5], ['query']),
    'get_report_by_month' : IDL.Func([IDL.Text], [Result_5], ['query']),
    'get_usd_to_idr_rate' : IDL.Func([], [Result_1], []),
    'set_wallet_address' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'transform' : IDL.Func([TransformArgs], [HttpResponse], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
