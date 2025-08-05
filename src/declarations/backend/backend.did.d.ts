import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : GetUtxosResponse } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : bigint } |
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
export interface Utxo { 'value' : bigint, 'outpoint' : OutPoint }
export interface _SERVICE {
  'add_budget' : ActorMethod<[string, number, string, string], Result>,
  'add_goal' : ActorMethod<
    [string, string, number, number, string, string, string, string],
    Result
  >,
  'add_manual_transaction' : ActorMethod<
    [number, string, string, string, string, string],
    Result
  >,
  'add_transaction' : ActorMethod<
    [number, string, string, boolean, string, string],
    Result
  >,
  'btc_to_satoshis' : ActorMethod<[number], bigint>,
  'convert_currency' : ActorMethod<[number, string, string], [] | [number]>,
  'fetch_btc_transactions' : ActorMethod<[], Result_1>,
  'format_btc_amount' : ActorMethod<[number], string>,
  'get_all_rates' : ActorMethod<[], Array<[string, string, number]>>,
  'get_balance' : ActorMethod<[string, [] | [string]], number>,
  'get_btc_balance' : ActorMethod<[], Result_2>,
  'get_budgets' : ActorMethod<[[] | [string]], Array<Budget>>,
  'get_currency_rate' : ActorMethod<[string, string], [] | [number]>,
  'get_goals' : ActorMethod<[], Array<Goal>>,
  'get_notifications' : ActorMethod<
    [[] | [string], boolean],
    Array<Notification>
  >,
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
  'update_budget_spent' : ActorMethod<[], Result>,
  'validate_btc_address' : ActorMethod<[string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
