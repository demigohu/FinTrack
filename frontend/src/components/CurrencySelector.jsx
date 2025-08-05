import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

export default function CurrencySelector({ className = '' }) {
  const { currency, setCurrency } = useContext(AuthContext);

  const currencies = [
    { value: 'idr', label: 'IDR', symbol: 'Rp' },
    { value: 'usd', label: 'USD', symbol: '$' },
    { value: 'btc', label: 'BTC', symbol: '₿' },
    { value: 'eth', label: 'ETH', symbol: 'Ξ' },
    { value: 'sol', label: 'SOL', symbol: '◎' },
  ];

  return (
    <select 
      className={`rounded px-2 py-1 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      value={currency}
      onChange={e => setCurrency(e.target.value)}
    >
      {currencies.map(curr => (
        <option key={curr.value} value={curr.value}>
          {curr.symbol} {curr.label}
        </option>
      ))}
    </select>
  );
} 