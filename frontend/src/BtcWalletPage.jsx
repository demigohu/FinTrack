import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext.jsx';
import toast, { Toaster } from 'react-hot-toast';

export function BtcWalletPage() {
  const { walletAddress, setWalletAddress, btcBalance, fetchBtcBalance, btcTransactions, fetchBtcTransactions, convertCurrency, currency } = useContext(AuthContext);
  const [inputAddress, setInputAddress] = useState("");
  const [localUtxos, setLocalUtxos] = useState([]);
  const pollingRef = useRef();

  // Polling UTXO dan notifikasi
  useEffect(() => {
    const poll = async () => {
      await fetchBtcTransactions();
    };
    poll();
    pollingRef.current = setInterval(poll, 10000); // setiap 10 detik
    return () => {
      clearInterval(pollingRef.current);
    };
  }, [walletAddress]);

  // Notifikasi jika ada UTXO baru
  useEffect(() => {
    if (!btcTransactions) return;
    // Cek UTXO baru
    const newUtxos = btcTransactions.filter(utxo => {
      return !localUtxos.some(local =>
        local.outpoint?.txid?.toString() === utxo.outpoint?.txid?.toString() &&
        local.outpoint?.vout === utxo.outpoint?.vout
      );
    });
    if (newUtxos.length > 0) {
      newUtxos.forEach(utxo => {
        toast.success(`You received ${Number(utxo.value) / 100_000_000} BTC!`);
      });
      setLocalUtxos(btcTransactions);
    } else if (btcTransactions.length !== localUtxos.length) {
      setLocalUtxos(btcTransactions);
    }
  }, [btcTransactions]);

  return (
    <div className="min-h-screen bg-[url('/bg-main.svg')] bg-cover flex flex-col items-center justify-start pt-16">
      <Toaster position="top-right" />
      <div className="max-w-lg w-full mt-10 mb-12 p-6 bg-gray-900/90 text-white rounded-2xl shadow-lg flex flex-col gap-4 border border-gray-800">
        <h2 className="text-2xl font-bold mb-2">BTC Wallet <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded ml-2">Regtest</span></h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            className="flex-1 rounded-l px-3 py-2 text-black focus:outline-none"
            placeholder="Enter BTC Regtest Address"
            value={inputAddress}
            onChange={e => setInputAddress(e.target.value)}
          />
          <button
            className="rounded-r bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold transition mt-2 sm:mt-0"
            onClick={() => setWalletAddress(inputAddress)}
          >
            Set Wallet Address
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
            onClick={fetchBtcBalance}
          >
            Fetch BTC Balance
          </button>
          <button
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-semibold transition"
            onClick={fetchBtcTransactions}
          >
            Fetch BTC Transactions
          </button>
        </div>
        <div className="text-sm mt-2">
          <span className="font-semibold">Current Wallet:</span>
          <span className="ml-2 break-all text-yellow-200">{walletAddress || <span className="text-gray-400">-</span>}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-lg">BTC Balance:</span>
          <span className="text-2xl font-mono text-yellow-400">{btcBalance} BTC</span>
        </div>
        <div>
          <span className="font-semibold">BTC Incomes (UTXO):</span>
          <div className="max-h-32 overflow-y-auto mt-2 bg-gray-800 rounded-lg p-2">
            {btcTransactions && btcTransactions.length > 0 ? (
              btcTransactions.map((utxo, idx) => {
                const amountBtc = Number(utxo.value) / 100_000_000;
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-700 py-2 text-xs sm:text-sm">
                    <div className="flex-1 break-all">
                      <span className="font-mono text-gray-400">txid:</span>
                      <span className="ml-1 select-all">{Array.isArray(utxo.outpoint?.txid) ? utxo.outpoint.txid.join('') : utxo.outpoint?.txid}</span>
                      <span className="ml-2 font-mono text-gray-400">vout:</span>
                      <span className="ml-1">{utxo.outpoint?.vout}</span>
                    </div>
                    <span className="ml-2 mt-1 sm:mt-0 bg-yellow-700 text-yellow-200 px-2 py-0.5 rounded font-mono">
                      {amountBtc} BTC
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-400 text-sm">No BTC UTXO found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 