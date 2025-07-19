import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface GetUtxosResponse {
  'next_page' : [] | [Uint8Array | number[]],
  'tip_height' : number,
  'tip_block_hash' : Uint8Array | number[],
  'utxos' : Array<Utxo>,
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface Outpoint { 'txid' : Uint8Array | number[], 'vout' : number }
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : number } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : GetUtxosResponse } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : [number, number] } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_5 = { 'Ok' : Array<Transaction> } |
  { 'Err' : string };
export interface Transaction {
  'id' : bigint,
  'is_income' : boolean,
  'date' : string,
  'description' : string,
  'currency' : string,
  'timestamp' : bigint,
  'category' : string,
  'amount' : number,
}
export interface TransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface Utxo {
  'height' : number,
  'value' : bigint,
  'outpoint' : Outpoint,
}
export interface _SERVICE {
  'add_expense' : ActorMethod<
    [
      Array<number>,
      Array<string>,
      Array<string>,
      BigUint64Array | bigint[],
      Array<string>,
    ],
    Result
  >,
  'add_income' : ActorMethod<
    [
      Array<number>,
      Array<string>,
      Array<string>,
      BigUint64Array | bigint[],
      Array<string>,
    ],
    Result
  >,
  'add_transaction' : ActorMethod<
    [
      Array<number>,
      Array<string>,
      Array<string>,
      Array<boolean>,
      BigUint64Array | bigint[],
      Array<string>,
    ],
    Result
  >,
  'convert_amount' : ActorMethod<[number, string, string], Result_1>,
  'fetch_btc_transactions' : ActorMethod<[], Result_2>,
  'get_ai_advice' : ActorMethod<[string, string, string], Result>,
  'get_analysis' : ActorMethod<[], Result_3>,
  'get_balance' : ActorMethod<[string, string], Result_1>,
  'get_btc_balance' : ActorMethod<[], Result_4>,
  'get_btc_rates' : ActorMethod<[], Result_3>,
  'get_expense' : ActorMethod<[string, string], Result_1>,
  'get_expense_report' : ActorMethod<[string], Result_5>,
  'get_filtered_transactions' : ActorMethod<[string, string, string], Result_5>,
  'get_income' : ActorMethod<[string, string], Result_1>,
  'get_income_report' : ActorMethod<[string], Result_5>,
  'get_manual_balance' : ActorMethod<[string], Result_1>,
  'get_report' : ActorMethod<[], Result_5>,
  'get_report_by_month' : ActorMethod<[string], Result_5>,
  'get_usd_to_idr_rate' : ActorMethod<[], Result_1>,
  'set_wallet_address' : ActorMethod<[string, string], Result>,
  'transform' : ActorMethod<[TransformArgs], HttpResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
