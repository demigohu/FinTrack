import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BalanceBreakdown {
  'eth_balance' : number,
  'usd_balance' : number,
  'sol_usd_value' : number,
  'btc_usd_value' : number,
  'negative_reason' : [] | [string],
  'btc_balance' : number,
  'eth_usd_value' : number,
  'sol_balance' : number,
  'total_usd_value' : number,
  'is_negative' : boolean,
}
export interface Budget {
  'id' : bigint,
  'updated_at' : bigint,
  'period' : string,
  'created_at' : bigint,
  'spent' : number,
  'currency' : string,
  'category' : string,
  'budget' : number,
}
export interface CurrencyRate {
  'btc_to_usd' : number,
  'last_updated' : bigint,
  'eth_to_usd' : number,
  'sol_to_usd' : number,
  'usd_to_idr' : number,
}
export interface GetUtxosResponse { 'utxos' : Array<Utxo> }
export interface Goal {
  'id' : bigint,
  'status' : string,
  'title' : string,
  'updated_at' : bigint,
  'description' : string,
  'deadline' : string,
  'created_at' : bigint,
  'current_amount' : number,
  'currency' : string,
  'target_amount' : number,
  'category' : string,
  'priority' : string,
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface Notification {
  'id' : bigint,
  'is_read' : boolean,
  'title' : string,
  'type_' : string,
  'message' : string,
  'timestamp' : bigint,
  'category' : string,
}
export interface OutPoint { 'txid' : Uint8Array | number[], 'vout' : number }
export interface PortfolioSummary {
  'diversification_score' : number,
  'balance_breakdown' : BalanceBreakdown,
  'asset_allocation' : Array<[string, number]>,
  'total_value_idr' : number,
  'total_value_usd' : number,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : GetUtxosResponse } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : CurrencyRate } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface Transaction {
  'id' : bigint,
  'conversion_rate' : [] | [number],
  'fee' : [] | [number],
  'confirmations' : [] | [number],
  'transaction_type' : [] | [string],
  'source' : [] | [string],
  'is_income' : boolean,
  'date' : string,
  'txid' : [] | [string],
  'description' : string,
  'currency' : string,
  'timestamp' : bigint,
  'converted_currency' : [] | [string],
  'category' : string,
  'converted_amount' : [] | [number],
  'amount' : number,
}
export interface TransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface Utxo { 'value' : bigint, 'outpoint' : OutPoint }
export interface _SERVICE {
  'add_budget' : ActorMethod<[string, number, string, string], Result>,
  'add_goal' : ActorMethod<
    [string, string, number, number, string, string, string, string],
    Result
  >,
  'add_manual_transaction' : ActorMethod<
    [number, string, string, string, string],
    Result
  >,
  'add_transaction' : ActorMethod<
    [number, string, boolean, string, string],
    Result
  >,
  'btc_to_satoshis' : ActorMethod<[number], bigint>,
  'convert_currency' : ActorMethod<[number, string, string], [] | [number]>,
  'fetch_btc_transactions' : ActorMethod<[], Result_1>,
  'fetch_real_time_rates' : ActorMethod<[], Result_2>,
  'format_btc_amount' : ActorMethod<[number], string>,
  'get_all_rates' : ActorMethod<[], Array<[string, string, number]>>,
  'get_balance' : ActorMethod<[string, [] | [string]], number>,
  'get_balance_breakdown' : ActorMethod<[], BalanceBreakdown>,
  'get_btc_balance' : ActorMethod<[], Result_3>,
  'get_budgets' : ActorMethod<[[] | [string]], Array<Budget>>,
  'get_crypto_balances' : ActorMethod<[], [number, number, number]>,
  'get_currency_rate' : ActorMethod<[string, string], [] | [number]>,
  'get_currency_rates' : ActorMethod<[], CurrencyRate>,
  'get_goals' : ActorMethod<[], Array<Goal>>,
  'get_notifications' : ActorMethod<
    [[] | [string], boolean],
    Array<Notification>
  >,
  'get_portfolio_summary' : ActorMethod<[], PortfolioSummary>,
  'get_total_balance_usd' : ActorMethod<[], number>,
  'get_total_expense' : ActorMethod<[string, [] | [string]], number>,
  'get_total_income' : ActorMethod<[string, [] | [string]], number>,
  'get_transactions' : ActorMethod<[], Array<Transaction>>,
  'get_transactions_by_currency' : ActorMethod<[string], Array<Transaction>>,
  'get_transactions_by_period' : ActorMethod<[string], Array<Transaction>>,
  'get_transactions_by_source' : ActorMethod<[string], Array<Transaction>>,
  'get_unread_notification_count' : ActorMethod<[], bigint>,
  'get_user_balance_summary' : ActorMethod<[], [number, number, number]>,
  'get_user_summary' : ActorMethod<[], [bigint, bigint, bigint, bigint]>,
  'get_wallet_address' : ActorMethod<[string], [] | [string]>,
  'mark_notification_read' : ActorMethod<[bigint], Result>,
  'satoshis_to_btc' : ActorMethod<[bigint], number>,
  'set_currency_rate' : ActorMethod<[string, string, number], Result>,
  'set_wallet_address' : ActorMethod<[string, string], Result>,
  'sync_blockchain_transactions' : ActorMethod<[], Result>,
  'transform' : ActorMethod<[TransformArgs], HttpResponse>,
  'update_budget_spent' : ActorMethod<[], Result>,
  'update_currency_rates' : ActorMethod<
    [number, number, number, number],
    Result
  >,
  'validate_btc_address' : ActorMethod<[string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
