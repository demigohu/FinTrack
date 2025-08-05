import React, { useState, useContext } from 'react';
import { transactionService } from '../services/backend';
import { AuthContext } from '../contexts/AuthContext';

export function AddTransaction({ isOpen, onClose, onTransactionAdded }) {
  const { currency } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    isIncome: false,
    currency: currency || 'IDR',
    date: new Date().toISOString().split('T')[0] // Default to today
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionType, setTransactionType] = useState('expense'); // 'expense', 'income', or 'investment'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate date
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      setError('Cannot select future dates');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting transaction:', formData);
      const result = await transactionService.addManualTransaction(
        parseFloat(formData.amount),
        formData.currency,
        formData.description,
        transactionType,
        formData.category,
        formData.date
      );

      console.log('Transaction result:', result);

      if (result.success) {
        setFormData({
          amount: '',
          description: '',
          category: '',
          isIncome: false,
          currency: currency || 'IDR',
          date: new Date().toISOString().split('T')[0]
        });
        setTransactionType('expense');
        onTransactionAdded();
        onClose();
      } else {
        console.error('Transaction failed:', result.error);
        setError(result.error || 'Failed to add transaction');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(`Network error: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Transaction
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formData.date && (
              <span>📅 {new Date(formData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setTransactionType('expense')}
                className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                  transactionType === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'border-gray-300 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                }`}
              >
                💸 Expense
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('income')}
                className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                  transactionType === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'border-gray-300 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                }`}
              >
                💰 Income
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('investment')}
                className={`flex-1 py-2 px-4 rounded-md border-2 transition-colors ${
                  transactionType === 'investment'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-300 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                }`}
              >
                📈 Investment
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              max={new Date().toISOString().split('T')[0]} // Cannot select future dates
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select the date when this transaction occurred (cannot be in the future)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select category</option>
              {transactionType === 'income' && ['IDR', 'USD'].includes(formData.currency) && (
                <>
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Business">Business</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Other Income">Other Income</option>
                </>
              )}
              
              {transactionType === 'expense' && ['IDR', 'USD'].includes(formData.currency) && (
                <>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Housing">Housing</option>
                  <option value="Other Expense">Other Expense</option>
                </>
              )}
              
              {['BTC', 'ETH', 'SOL'].includes(formData.currency) && (
                <>
                  <option value="Crypto_Buy">Buy {formData.currency}</option>
                  <option value="Crypto_Sell">Sell {formData.currency}</option>
                  <option value="Crypto_Transfer">Transfer {formData.currency}</option>
                  <option value="Crypto_Received">Received {formData.currency}</option>
                  <option value="Crypto_Sent">Sent {formData.currency}</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <optgroup label="Fiat Money">
                <option value="IDR">IDR - Indonesian Rupiah</option>
                <option value="USD">USD - US Dollar</option>
              </optgroup>
              <optgroup label="Cryptocurrency">
                <option value="BTC">BTC - Bitcoin</option>
                <option value="ETH">ETH - Ethereum</option>
                <option value="SOL">SOL - Solana</option>
              </optgroup>
            </select>
          </div>



          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}